'use strict';

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { QUEUE_NAMES } = require('@resume-etl/queue');
const { BatchStatuses, ErrorCodes } = require('@resume-etl/types');
const { createLogger } = require('@resume-etl/logger');
const { BatchRepository } = require('../repositories/batch.repository');
const { AppError } = require('../middleware/errorHandler.middleware');

const logger = createLogger('batch-service');

/**
 * Batch service — business logic for batch upload, status, and export.
 */
class BatchService {
    /**
     * @param {object} deps
     * @param {import('pg').Pool} deps.dbPool
     * @param {import('@resume-etl/storage').S3Adapter} deps.storage
     * @param {import('@resume-etl/queue').QueueProvider} deps.queue
     */
    constructor(deps) {
        this._storage = deps.storage;
        this._queue = deps.queue;
        this._repo = new BatchRepository(deps.dbPool);
    }

    /**
     * Process a batch upload: store files, create DB records, enqueue jobs.
     * @param {Express.Multer.File[]} files
     * @returns {Promise<object>} Created batch
     */
    async uploadBatch(files) {
        // 1. Create batch record
        const batch = await this._repo.createBatch(files.length);
        const batchId = batch.id;

        logger.info('Batch created', { batchId, fileCount: files.length });

        // 2. Upload files and create candidate records
        const jobPayloads = [];

        for (const file of files) {
            const ext = path.extname(file.originalname).toLowerCase();
            const fileKey = `resumes/${batchId}/${uuidv4()}${ext}`;

            // Upload to storage
            await this._storage.uploadFile(fileKey, file.buffer, file.mimetype);

            // Create candidate record
            const candidate = await this._repo.createCandidate({
                batch_id: batchId,
                file_key: fileKey,
            });

            jobPayloads.push({
                job_id: candidate.id,
                batch_id: batchId,
                file_key: fileKey,
                file_name: file.originalname,
                file_type: ext.replace('.', ''),
            });
        }

        // 3. Enqueue parse jobs in bulk
        await this._queue.addBulkJobs(QUEUE_NAMES.RESUME_PARSE, jobPayloads);

        // 4. Update batch status
        await this._repo.updateBatchStatus(batchId, BatchStatuses.PROCESSING);

        logger.info('Batch processing started', { batchId, jobCount: jobPayloads.length });

        return {
            id: batchId,
            status: BatchStatuses.PROCESSING,
            resume_count: files.length,
        };
    }

    /**
     * Get batch status with candidate summary.
     * @param {string} batchId
     * @returns {Promise<object>}
     */
    async getBatchStatus(batchId) {
        const batch = await this._repo.getBatchById(batchId);

        if (!batch) {
            throw new AppError(
                ErrorCodes.NOT_FOUND,
                'Batch not found',
                404,
                { batchId }
            );
        }

        const summary = await this._repo.getBatchStatusSummary(batchId);

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

    /**
     * Trigger export for a completed batch.
     * @param {string} batchId
     * @returns {Promise<object>}
     */
    async triggerExport(batchId) {
        const batch = await this._repo.getBatchById(batchId);

        if (!batch) {
            throw new AppError(ErrorCodes.NOT_FOUND, 'Batch not found', 404);
        }

        // If already exported, return the download URL
        if (batch.status === BatchStatuses.EXPORTED && batch.export_file_key) {
            const downloadUrl = await this._storage.getSignedUrl(batch.export_file_key);
            return { batchId, status: 'exported', downloadUrl };
        }

        // Check if batch is ready for export
        const summary = await this._repo.getBatchStatusSummary(batchId);
        const totalDone = parseInt(summary.completed, 10) + parseInt(summary.failed, 10);

        if (totalDone < parseInt(summary.total, 10)) {
            throw new AppError(
                ErrorCodes.BATCH_NOT_READY,
                'Batch is still processing. Please wait for all resumes to be parsed.',
                409,
                { completed: summary.completed, total: summary.total }
            );
        }

        // Enqueue export job
        await this._queue.addJob(QUEUE_NAMES.EXPORT, { batch_id: batchId });
        await this._repo.updateBatchStatus(batchId, BatchStatuses.EXPORTING);

        logger.info('Export triggered', { batchId });

        return { batchId, status: 'exporting' };
    }
}

module.exports = { BatchService };
