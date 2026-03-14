'use strict';

const { Router } = require('express');
const multer = require('multer');
const { BatchController } = require('../controllers/batch.controller');
const { fileValidationMiddleware } = require('../middleware/fileValidation.middleware');

/**
 * Creates batch routes with injected dependencies.
 * @param {object} deps
 * @returns {Router}
 */
function createBatchRoutes(deps) {
    const router = Router();
    const controller = new BatchController(deps);

    // Multer config: memory storage for buffer access
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: deps.config.limits.maxFileSizeMb * 1024 * 1024,
            files: deps.config.limits.maxFilesPerBatch,
        },
    });

    // POST /batches/upload
    router.post(
        '/upload',
        upload.array('resumes', deps.config.limits.maxFilesPerBatch),
        fileValidationMiddleware(deps.config.limits),
        (req, res, next) => controller.upload(req, res, next)
    );

    // GET /batches/:id/status
    router.get(
        '/:id/status',
        (req, res, next) => controller.getStatus(req, res, next)
    );

    // GET /batches/:id/export
    router.get(
        '/:id/export',
        (req, res, next) => controller.exportBatch(req, res, next)
    );

    return router;
}

module.exports = { createBatchRoutes };
