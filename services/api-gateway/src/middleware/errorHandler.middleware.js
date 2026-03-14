'use strict';

const { createLogger } = require('@resume-etl/logger');
const { ErrorCodes } = require('@resume-etl/types');

const logger = createLogger('api-gateway');

/**
 * Application-level error class with code and context.
 */
class AppError extends Error {
    /**
     * @param {string} code - Error code from ErrorCodes
     * @param {string} message - Human-readable message
     * @param {number} [statusCode=500]
     * @param {object} [context]
     */
    constructor(code, message, statusCode = 500, context = {}) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
    }
}

/**
 * Centralized error handler middleware.
 * Logs full error details, returns sanitized response.
 */
function errorHandler(err, req, res, _next) {
    const isAppError = err instanceof AppError;

    const statusCode = isAppError ? err.statusCode : 500;
    const code = isAppError ? err.code : ErrorCodes.INTERNAL_ERROR;
    const message = isAppError ? err.message : 'An unexpected error occurred';

    logger.error('Request error', {
        code,
        message: err.message,
        stack: err.stack,
        context: isAppError ? err.context : {},
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        success: false,
        error: { code, message },
    });
}

module.exports = { AppError, errorHandler };
