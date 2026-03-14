'use strict';

const { fileValidationMiddleware } = require('../src/middleware/fileValidation.middleware');

describe('fileValidationMiddleware', () => {
    const config = { maxFileSizeMb: 10, maxFilesPerBatch: 1000 };
    let middleware, req, res, next;

    beforeEach(() => {
        middleware = fileValidationMiddleware(config);
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    test('should reject if no files uploaded', () => {
        req = { files: [] };
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid file extension', () => {
        req = {
            files: [{
                originalname: 'resume.txt',
                mimetype: 'text/plain',
                size: 1024,
            }],
        };
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should reject oversized files', () => {
        req = {
            files: [{
                originalname: 'resume.pdf',
                mimetype: 'application/pdf',
                size: 20 * 1024 * 1024, // 20MB
            }],
        };
        middleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should accept valid PDF file', () => {
        req = {
            files: [{
                originalname: 'resume.pdf',
                mimetype: 'application/pdf',
                size: 1024 * 1024, // 1MB
            }],
        };
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('should accept valid DOCX file', () => {
        req = {
            files: [{
                originalname: 'resume.docx',
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                size: 512 * 1024,
            }],
        };
        middleware(req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
