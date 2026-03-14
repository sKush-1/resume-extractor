'use strict';

const { AppError, errorHandler } = require('../src/middleware/errorHandler.middleware');
const { ErrorCodes } = require('@resume-etl/types');

// Mock logger to prevent console output during tests
jest.mock('@resume-etl/logger', () => ({
    createLogger: () => ({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }),
}));

describe('AppError', () => {
    test('should create an error with code and message', () => {
        const error = new AppError(ErrorCodes.NOT_FOUND, 'Batch not found', 404);
        expect(error.code).toBe(ErrorCodes.NOT_FOUND);
        expect(error.message).toBe('Batch not found');
        expect(error.statusCode).toBe(404);
    });

    test('should default to 500 status code', () => {
        const error = new AppError(ErrorCodes.INTERNAL_ERROR, 'Something broke');
        expect(error.statusCode).toBe(500);
    });
});

describe('errorHandler', () => {
    let req, res;

    beforeEach(() => {
        req = { path: '/test', method: 'GET' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    test('should handle AppError with correct status', () => {
        const err = new AppError(ErrorCodes.NOT_FOUND, 'Not found', 404);
        errorHandler(err, req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: { code: ErrorCodes.NOT_FOUND, message: 'Not found' },
        });
    });

    test('should handle generic errors with 500', () => {
        const err = new Error('Unexpected');
        errorHandler(err, req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: ErrorCodes.INTERNAL_ERROR,
                message: 'An unexpected error occurred',
            },
        });
    });
});
