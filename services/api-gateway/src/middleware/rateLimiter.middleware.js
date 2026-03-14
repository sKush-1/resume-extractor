'use strict';

const rateLimit = require('express-rate-limit');
const { ErrorCodes } = require('@resume-etl/types');

/**
 * Creates rate limiter middleware.
 * @param {object} config
 * @param {number} config.windowMs
 * @param {number} config.maxRequests
 * @returns {import('express').RequestHandler}
 */
function rateLimiterMiddleware(config) {
    return rateLimit({
        windowMs: config.windowMs,
        max: config.maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
            res.status(429).json({
                success: false,
                error: {
                    code: ErrorCodes.RATE_LIMITED,
                    message: 'Too many requests. Please try again later.',
                },
            });
        },
    });
}

module.exports = { rateLimiterMiddleware };
