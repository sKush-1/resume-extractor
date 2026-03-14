'use strict';

const { authMiddleware } = require('../src/middleware/auth.middleware');

describe('authMiddleware', () => {
    const API_KEY = 'test-api-key';
    let middleware, req, res, next;

    beforeEach(() => {
        middleware = authMiddleware(API_KEY);
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test('should call next() with valid API key', () => {
        req.headers['x-api-key'] = API_KEY;
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 401 with missing API key', () => {
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 with invalid API key', () => {
        req.headers['x-api-key'] = 'wrong-key';
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});
