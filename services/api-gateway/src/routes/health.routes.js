'use strict';

const { Router } = require('express');

/**
 * Health check routes.
 * @param {object} deps
 * @returns {Router}
 */
function createHealthRoutes(deps) {
    const router = Router();

    router.get('/', async (_req, res) => {
        try {
            // Check database connectivity
            await deps.dbPool.query('SELECT 1');

            res.json({
                success: true,
                data: {
                    status: 'healthy',
                    service: 'api-gateway',
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (err) {
            res.status(503).json({
                success: false,
                data: {
                    status: 'unhealthy',
                    service: 'api-gateway',
                    error: 'Database connection failed',
                },
            });
        }
    });

    return router;
}

module.exports = { createHealthRoutes };
