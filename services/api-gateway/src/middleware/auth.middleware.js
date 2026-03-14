'use strict';

const { ErrorCodes } = require('@resume-etl/types');

/**
 * API key authentication middleware.
 * Expects header: x-api-key
 *
 * @param {string} apiKey
 * @returns {import('express').RequestHandler}
 */
function authMiddleware(apiKey) {
    return (req, res, next) => {
        const providedKey = req.headers['x-api-key'];

        if (!providedKey || providedKey !== apiKey) {
            return res.status(401).json({
                success: false,
                error: {
                    code: ErrorCodes.UNAUTHORIZED,
                    message: 'Invalid or missing API key',
                },
            });
        }

        next();
    };
}

module.exports = { authMiddleware };
