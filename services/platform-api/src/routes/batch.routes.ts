import { FastifyInstance } from "fastify";
import {
    uploadBatch,
    getBatchStatus,
    exportBatch,
    getBatches,
    getCandidates,
    getDashboardStats,
} from "../controllers/batch.controller";
import { authMiddleware } from "../middlewares/middleware.auth";

export const batchRoutes = async (fastify: FastifyInstance) => {
    // Rate limiting for these routes: 5 requests per minute per IP
    // Note: We apply this globally or per route. Since the user asked for this endpoint limitation.

    fastify.addHook("preHandler", authMiddleware);

    fastify.get("/", getBatches);
    fastify.get("/stats", getDashboardStats);

    fastify.post("/upload", {
        config: {
            rateLimit: {
                max: 5,
                timeWindow: "1 minute"
            }
        }
    }, uploadBatch);

    fastify.get("/:id/status", getBatchStatus);
    fastify.get("/:id/export", exportBatch);
    fastify.get("/:id/candidates", getCandidates);
};
