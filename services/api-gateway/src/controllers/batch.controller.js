'use strict';

const { BatchService } = require('../services/batch.service');

/**
 * Batch controller — thin layer delegating to BatchService.
 */
class BatchController {
    /**
     * @param {object} deps
     */
    constructor(deps) {
        this._service = new BatchService(deps);
    }

    /**
     * POST /batches/upload
     * Handles multi-file upload.
     */
    async upload(req, res, next) {
        try {
            const result = await this._service.uploadBatch(req.files);
            res.status(201).json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /batches/:id/status
     */
    async getStatus(req, res, next) {
        try {
            const result = await this._service.getBatchStatus(req.params.id);
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /batches/:id/export
     * Triggers export or returns download URL.
     */
    async exportBatch(req, res, next) {
        try {
            const result = await this._service.triggerExport(req.params.id);
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = { BatchController };
