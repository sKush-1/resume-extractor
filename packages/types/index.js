'use strict';

/**
 * @typedef {Object} CandidateData
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string[]} skills
 * @property {string} experience_years
 * @property {string[]} education
 * @property {string[]} companies
 * @property {string} location
 */

/**
 * @typedef {Object} Candidate
 * @property {string} id
 * @property {string} batch_id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string[]} skills
 * @property {string} experience_years
 * @property {string[]} education
 * @property {string[]} companies
 * @property {string} location
 * @property {string} file_key
 * @property {string} created_at
 */

/**
 * @typedef {'pending'|'processing'|'completed'|'failed'|'exporting'|'exported'} BatchStatus
 */

/**
 * @typedef {Object} Batch
 * @property {string} id
 * @property {BatchStatus} status
 * @property {string} created_at
 * @property {string|null} completed_at
 * @property {number} resume_count
 * @property {number} processed_count
 * @property {number} failed_count
 * @property {string|null} export_file_key
 */

/**
 * @typedef {Object} JobPayload
 * @property {string} job_id
 * @property {string} batch_id
 * @property {string} file_key
 * @property {string} file_name
 * @property {string} file_type
 */

/**
 * @typedef {Object} ExportJobPayload
 * @property {string} batch_id
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} [data]
 * @property {ApiError} [error]
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code
 * @property {string} message
 */

// Error codes
const ErrorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
    QUEUE_ERROR: 'QUEUE_ERROR',
    AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
    PARSE_ERROR: 'PARSE_ERROR',
    EXPORT_ERROR: 'EXPORT_ERROR',
    BATCH_NOT_READY: 'BATCH_NOT_READY',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    BATCH_LIMIT_EXCEEDED: 'BATCH_LIMIT_EXCEEDED',
};

// Batch statuses
const BatchStatuses = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    EXPORTING: 'exporting',
    EXPORTED: 'exported',
};

// Allowed file types
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

module.exports = {
    ErrorCodes,
    BatchStatuses,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
};
