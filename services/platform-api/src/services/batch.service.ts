import pool from "../config/database/db.config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Queue } from "bullmq";
import crypto from "node:crypto";
import path from "node:path";
import { Batch, BatchStatus, Candidate } from "../interfaces/batches";
import logger from "../utils/logger";

const MAX_BATCHES_PER_DAY = 3;
const MAX_RESUMES_PER_BATCH = 20;
const MAX_FREE_FILE_SIZE_MB = 20;

export class BatchService {
    private s3Client: S3Client;
    private parseQueue: Queue;
    private exportQueue: Queue;

    constructor() {
        this.s3Client = new S3Client({
            region: process.env.S3_REGION || "us-east-1",
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || "minioadmin",
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "minioadmin",
            },
        });

        const redisOptions = {
            host: process.env.redisHost || "127.0.0.1",
            port: Number(process.env.redisPORT) || 6379,
        };

        this.parseQueue = new Queue("resume-parse", {
            connection: redisOptions,
        });

        this.exportQueue = new Queue("export", {
            connection: redisOptions,
        });
    }

    async getDailyBatchCount(userId: string, ip: string, fingerprint?: string): Promise<number> {
        const result = await pool.query(
            `SELECT COUNT(*) as count 
       FROM batches 
       WHERE (user_id = $1 OR ip_address = $2 OR fingerprint = $3) 
       AND created_at > CURRENT_DATE`,
            [userId, ip, fingerprint]
        );
        return parseInt(result.rows[0].count, 10);
    }

    async uploadBatch(
        userId: string,
        name: string,
        files: any[],
        metrics: any[] = [],
        ip: string = "",
        fingerprint: string = ""
    ): Promise<Batch> {
        // 1. Check daily batch limit
        const dailyBatches = await this.getDailyBatchCount(userId, ip, fingerprint);
        if (dailyBatches >= MAX_BATCHES_PER_DAY) {
            throw new Error(`Daily limit reached (${MAX_BATCHES_PER_DAY} batches per day). Please try again tomorrow.`);
        }

        // 2. Validate batch size (max 20 resumes)
        if (files.length > MAX_RESUMES_PER_BATCH) {
            throw new Error(`Maximum ${MAX_RESUMES_PER_BATCH} resumes allowed per batch.`);
        }

        let filesToProcess = files;

        // 3. Validate file sizes and sanitize metrics
        const sanitizedMetrics = Array.isArray(metrics)
            ? metrics.map(m => ({ ...m, name: m.name.trim() }))
            : [];

        for (const file of filesToProcess) {
            const sizeMB = file.data.length / (1024 * 1024);
            if (sizeMB > MAX_FREE_FILE_SIZE_MB) {
                throw new Error(`File ${file.filename} exceeds the ${MAX_FREE_FILE_SIZE_MB}MB limit.`);
            }
        }

        // 4. Create batch record
        const batchResult = await pool.query(
            `INSERT INTO batches (user_id, name, status, resume_count, metrics, ip_address, fingerprint)
       VALUES ($1, $2, 'processing', $3, $4, $5, $6)
       RETURNING *`,
            [userId, name, filesToProcess.length, JSON.stringify(sanitizedMetrics), ip, fingerprint]
        );
        const batch = batchResult.rows[0];

        // 4. Upload and Enqueue
        const jobPayloads = [];
        for (const file of filesToProcess) {
            const ext = path.extname(file.filename).toLowerCase();
            const fileKey = `resumes/${batch.id}/${crypto.randomUUID()}${ext}`;

            // Upload to S3
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: process.env.S3_BUCKET || "resumes",
                    Key: fileKey,
                    Body: file.data,
                    ContentType: file.mimetype,
                })
            );

            // Create candidate record
            const candResult = await pool.query(
                `INSERT INTO candidates (batch_id, file_key, file_size, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
                [batch.id, fileKey, file.data.length]
            );
            const candidate = candResult.rows[0];

            jobPayloads.push({
                name: "resume-parse",
                data: {
                    job_id: candidate.id,
                    batch_id: batch.id,
                    user_id: userId,
                    file_key: fileKey,
                    file_name: file.filename,
                    file_type: ext.replace(".", ""),
                    metrics: sanitizedMetrics,
                },
            });
        }

        // Add to queue
        await this.parseQueue.addBulk(jobPayloads);

        logger.info("Free user batch created", { userId, batchId: batch.id, count: files.length });

        return batch;
    }

    async getBatchStatus(userId: string, batchId: string): Promise<any> {
        const batchResult = await pool.query(
            `SELECT * FROM batches WHERE id = $1 AND user_id = $2`,
            [batchId, userId]
        );

        if (batchResult.rowCount === 0) {
            throw new Error("Batch not found or unauthorized");
        }

        const batch = batchResult.rows[0];

        const summaryResult = await pool.query(
            `SELECT
         COUNT(*) FILTER (WHERE status = 'completed') AS completed,
         COUNT(*) FILTER (WHERE status = 'failed') AS failed,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE status = 'processing') AS processing,
         COUNT(*) AS total
       FROM candidates WHERE batch_id = $1`,
            [batchId]
        );
        const summary = summaryResult.rows[0];

        return {
            ...batch,
            candidates: {
                total: parseInt(summary.total, 10),
                completed: parseInt(summary.completed, 10),
                failed: parseInt(summary.failed, 10),
                pending: parseInt(summary.pending, 10),
                processing: parseInt(summary.processing, 10),
            },
        };
    }

    async triggerExport(userId: string, batchId: string): Promise<any> {
        const batchResult = await pool.query(
            `SELECT * FROM batches WHERE id = $1 AND user_id = $2`,
            [batchId, userId]
        );

        if (batchResult.rowCount === 0) {
            throw new Error("Batch not found or unauthorized");
        }

        const batch = batchResult.rows[0];

        // If already exported, return signed URL
        if (batch.status === "exported" && batch.export_file_key) {
            const signedUrl = await getSignedUrl(
                this.s3Client as any,
                new GetObjectCommand({
                    Bucket: process.env.S3_BUCKET || "resumes",
                    Key: batch.export_file_key,
                }) as any,
                { expiresIn: 7 * 24 * 3600 }
            );
            return { status: "exported", downloadUrl: signedUrl };
        }

        // Check if ready
        const summaryResult = await pool.query(
            `SELECT COUNT(*) FROM candidates WHERE batch_id = $1 AND status IN ('pending', 'processing')`,
            [batchId]
        );
        const pendingCount = parseInt(summaryResult.rows[0].count, 10);

        if (pendingCount > 0) {
            throw new Error("Batch is still processing");
        }

        // Enqueue export
        await this.exportQueue.add("export", { batch_id: batchId, user_id: userId });

        await pool.query(
            `UPDATE batches SET status = 'exporting' WHERE id = $1`,
            [batchId]
        );

        return { status: "exporting" };
    }

    async listBatches(userId: string): Promise<Batch[]> {
        const result = await pool.query(
            `SELECT * FROM batches WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    async getCandidates(userId: string, batchId: string): Promise<Candidate[]> {
        // Verify ownership
        const batch = await pool.query(
            "SELECT id FROM batches WHERE id = $1 AND user_id = $2",
            [batchId, userId]
        );
        if (batch.rowCount === 0) {
            throw new Error("Batch not found or unauthorized");
        }

        const result = await pool.query(
            `SELECT * FROM candidates WHERE batch_id = $1 ORDER BY created_at`,
            [batchId]
        );
        return result.rows;
    }

    async getDashboardStats(userId: string): Promise<any> {
        const statsResult = await pool.query(
            `SELECT 
                COALESCE(SUM(resume_count), 0) as "totalResumes",
                COUNT(*) FILTER (WHERE status = 'processing') as "activeBatches",
                COUNT(*) FILTER (WHERE status IN ('completed', 'exported')) as "completedBatches",
                AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60) FILTER (WHERE completed_at IS NOT NULL) as "avgProcessingTime"
             FROM batches 
             WHERE user_id = $1`,
            [userId]
        );

        const stats = statsResult.rows[0];
        const totalBatchesResult = await pool.query(
            `SELECT COUNT(*) as count FROM batches WHERE user_id = $1`,
            [userId]
        );

        return {
            totalBatches: parseInt(totalBatchesResult.rows[0].count, 10),
            totalResumes: parseInt(stats.totalResumes, 10),
            activeBatches: parseInt(stats.activeBatches, 10),
            completedBatches: parseInt(stats.completedBatches, 10),
            avgProcessingTime: stats.avgProcessingTime ? parseFloat(parseFloat(stats.avgProcessingTime).toFixed(1)) : 0,
        };
    }
}
