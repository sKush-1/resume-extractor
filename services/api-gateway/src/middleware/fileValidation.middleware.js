'use strict';

const path = require('path');
const { ErrorCodes, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } = require('@resume-etl/types');

/**
 * Validate uploaded files for type and size.
 *
 * @param {object} config
 * @param {number} config.maxFileSizeMb
 * @param {number} config.maxFilesPerBatch
 * @returns {import('express').RequestHandler}
 */
function fileValidationMiddleware(config) {
    const maxBytes = config.maxFileSizeMb * 1024 * 1024;

    return (req, res, next) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: ErrorCodes.VALIDATION_ERROR,
                    message: 'No files uploaded',
                },
            });
        }

        if (req.files.length > config.maxFilesPerBatch) {
            return res.status(400).json({
                success: false,
                error: {
                    code: ErrorCodes.BATCH_LIMIT_EXCEEDED,
                    message: `Maximum ${config.maxFilesPerBatch} files per batch`,
                },
            });
        }

        for (const file of req.files) {
            const ext = path.extname(file.originalname).toLowerCase();

            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: ErrorCodes.INVALID_FILE_TYPE,
                        message: `Invalid file type: ${file.originalname}. Only PDF, DOCX and TXT are allowed.`,
                    },
                });
            }

            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: ErrorCodes.INVALID_FILE_TYPE,
                        message: `Invalid MIME type for: ${file.originalname}`,
                    },
                });
            }

            if (file.size > maxBytes) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: ErrorCodes.FILE_TOO_LARGE,
                        message: `File too large: ${file.originalname}. Max size: ${config.maxFileSizeMb}MB`,
                    },
                });
            }
        }

        next();
    };
}

module.exports = { fileValidationMiddleware };
