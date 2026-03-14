'use strict';

const { createLogger: winstonCreateLogger, format, transports } = require('winston');

const { combine, timestamp, json, errors, printf } = format;

/**
 * Creates a structured JSON logger for a given service.
 *
 * @param {string} service - The name of the service (e.g., 'api-gateway')
 * @param {object} [options] - Optional overrides
 * @param {string} [options.level] - Log level (default: based on NODE_ENV)
 * @returns {import('winston').Logger}
 */
function createLogger(service, options = {}) {
    const level = options.level || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

    const structuredFormat = printf(({ timestamp: ts, level: lvl, message, service: svc, ...metadata }) => {
        const logEntry = {
            timestamp: ts,
            service: svc,
            level: lvl,
            message,
        };

        if (Object.keys(metadata).length > 0) {
            logEntry.metadata = metadata;
        }

        return JSON.stringify(logEntry);
    });

    const logger = winstonCreateLogger({
        level,
        defaultMeta: { service },
        format: combine(
            errors({ stack: true }),
            timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
            json(),
            structuredFormat
        ),
        transports: [
            new transports.Console(),
        ],
        exitOnError: false,
    });

    return logger;
}

module.exports = { createLogger };
