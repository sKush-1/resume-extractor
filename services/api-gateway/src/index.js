'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createLogger } = require('@resume-etl/logger');
const { createStorageProvider } = require('@resume-etl/storage');
const { createQueueProvider } = require('@resume-etl/queue');
const config = require('@resume-etl/config');

const { createPool } = require('./db/pool');
const { authMiddleware } = require('./middleware/auth.middleware');
const { rateLimiterMiddleware } = require('./middleware/rateLimiter.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const { createBatchRoutes } = require('./routes/batch.routes');
const { createHealthRoutes } = require('./routes/health.routes');

const logger = createLogger('api-gateway');

async function bootstrap() {
    const app = express();

    // ─── Core Middleware ─────────────────────────────
    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    // ─── Rate Limiting ──────────────────────────────
    app.use(rateLimiterMiddleware(config.rateLimit));

    // ─── Dependency Injection ───────────────────────
    const dbPool = createPool(config.db);
    const storage = createStorageProvider(config.storage);
    const queue = createQueueProvider(config.redis.url);

    const deps = { dbPool, storage, queue, config, logger };

    // ─── Routes ─────────────────────────────────────
    app.use('/health', createHealthRoutes(deps));
    app.use('/batches', authMiddleware(config.apiKey), createBatchRoutes(deps));

    // ─── Error Handler ──────────────────────────────
    app.use(errorHandler);

    // ─── Start Server ───────────────────────────────
    const server = app.listen(config.port, () => {
        logger.info(`API Gateway running on port ${config.port}`, {
            env: config.env,
        });
    });

    // ─── Graceful Shutdown ──────────────────────────
    const shutdown = async (signal) => {
        logger.info(`${signal} received, shutting down gracefully`);
        server.close();
        await queue.close();
        await dbPool.end();
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
    logger.error('Failed to start API Gateway', { error: err.message, stack: err.stack });
    process.exit(1);
});
