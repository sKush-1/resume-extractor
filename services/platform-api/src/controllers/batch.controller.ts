import { FastifyReply, FastifyRequest } from "fastify";
import { BatchService } from "../services/batch.service";
import logger from "../utils/logger";

const batchService = new BatchService();

export const uploadBatch = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const userId = request.user_id;
        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const parts = request.parts();
        let batchName = "Untitled Batch";
        let metrics: any[] = [];
        const files: any[] = [];

        for await (const part of parts) {
            if (part.type === "file") {
                const buffer = await part.toBuffer();
                files.push({
                    filename: part.filename,
                    mimetype: part.mimetype,
                    data: buffer,
                });
            } else {
                if (part.fieldname === "name") {
                    batchName = (part as any).value;
                } else if (part.fieldname === "metrics") {
                    try {
                        metrics = JSON.parse((part as any).value);
                    } catch (e) {
                        logger.error("Failed to parse metrics", e);
                    }
                }
            }
        }

        if (files.length === 0) {
            return reply.code(400).send({ error: "No files uploaded" });
        }

        const batch = await batchService.uploadBatch(userId, batchName, files, metrics);
        return reply.code(201).send({ success: true, data: batch });
    } catch (error: any) {
        logger.error("Error in uploadBatch controller", error);
        return reply.code(400).send({ error: error.message });
    }
};

export const getBatchStatus = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const userId = request.user_id;
        const batchId = request.params.id;

        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const status = await batchService.getBatchStatus(userId, batchId);
        return reply.send({ success: true, data: status });
    } catch (error: any) {
        logger.error("Error in getBatchStatus controller", error);
        return reply.code(400).send({ error: error.message });
    }
};

export const exportBatch = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const userId = request.user_id;
        const batchId = request.params.id;

        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const result = await batchService.triggerExport(userId, batchId);
        return reply.send({ success: true, data: result });
    } catch (error: any) {
        logger.error("Error in exportBatch controller", error);
        return reply.code(400).send({ error: error.message });
    }
};

export const getBatches = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const userId = request.user_id;
        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const batches = await batchService.listBatches(userId);
        return reply.send({ success: true, data: batches });
    } catch (error: any) {
        logger.error("Error in getBatches controller", error);
        return reply.code(400).send({ error: error.message });
    }
};

export const getCandidates = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    try {
        const userId = request.user_id;
        const batchId = request.params.id;

        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const candidates = await batchService.getCandidates(userId, batchId);
        return reply.send({ success: true, data: candidates });
    } catch (error: any) {
        logger.error("Error in getCandidates controller", error);
        return reply.code(400).send({ error: error.message });
    }
};

export const getDashboardStats = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const userId = request.user_id;
        if (!userId) {
            return reply.code(401).send({ error: "Unauthorized" });
        }

        const stats = await batchService.getDashboardStats(userId);
        return reply.send({ success: true, data: stats });
    } catch (error: any) {
        logger.error("Error in getDashboardStats controller", error);
        return reply.code(400).send({ error: error.message });
    }
};
