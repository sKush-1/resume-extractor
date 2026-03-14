'use strict';

const { BatchStatuses } = require('@resume-etl/types');

/**
 * Batch repository — PostgreSQL queries for batches and candidates.
 */
class BatchRepository {
    /**
     * @param {import('pg').Pool} pool
     */
    constructor(pool) {
        this._pool = pool;
    }

    /**
     * Create a new batch.
     * @param {number} resumeCount
     * @returns {Promise<object>} Created batch
     */
    async createBatch(resumeCount) {
        const result = await this._pool.query(
            `INSERT INTO batches (status, resume_count)
       VALUES ($1, $2)
       RETURNING *`,
            [BatchStatuses.PENDING, resumeCount]
        );
        return result.rows[0];
    }

    /**
     * Get a batch by ID.
     * @param {string} batchId
     * @returns {Promise<object|null>}
     */
    async getBatchById(batchId) {
        const result = await this._pool.query(
            'SELECT * FROM batches WHERE id = $1',
            [batchId]
        );
        return result.rows[0] || null;
    }

    /**
     * Update batch status.
     * @param {string} batchId
     * @param {string} status
     * @param {object} [extra] - Additional fields to set
     * @returns {Promise<object>}
     */
    async updateBatchStatus(batchId, status, extra = {}) {
        const sets = ['status = $2'];
        const values = [batchId, status];
        let idx = 3;

        if (extra.completed_at) {
            sets.push(`completed_at = $${idx}`);
            values.push(extra.completed_at);
            idx++;
        }

        if (extra.export_file_key) {
            sets.push(`export_file_key = $${idx}`);
            values.push(extra.export_file_key);
            idx++;
        }

        const result = await this._pool.query(
            `UPDATE batches SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
            values
        );
        return result.rows[0];
    }

    /**
     * Increment the processed count for a batch.
     * @param {string} batchId
     * @returns {Promise<object>}
     */
    async incrementProcessedCount(batchId) {
        const result = await this._pool.query(
            `UPDATE batches SET processed_count = processed_count + 1 WHERE id = $1 RETURNING *`,
            [batchId]
        );
        return result.rows[0];
    }

    /**
     * Increment the failed count for a batch.
     * @param {string} batchId
     * @returns {Promise<object>}
     */
    async incrementFailedCount(batchId) {
        const result = await this._pool.query(
            `UPDATE batches SET failed_count = failed_count + 1 WHERE id = $1 RETURNING *`,
            [batchId]
        );
        return result.rows[0];
    }

    /**
     * Insert a candidate record (pending state).
     * @param {object} candidate
     * @returns {Promise<object>}
     */
    async createCandidate(candidate) {
        const result = await this._pool.query(
            `INSERT INTO candidates (batch_id, file_key, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
            [candidate.batch_id, candidate.file_key]
        );
        return result.rows[0];
    }

    /**
     * Update a candidate with parsed data.
     * @param {string} candidateId
     * @param {object} data
     * @returns {Promise<object>}
     */
    async updateCandidateData(candidateId, data) {
        const result = await this._pool.query(
            `UPDATE candidates SET
         name = $2, email = $3, phone = $4,
         skills = $5, experience_years = $6,
         education = $7, companies = $8,
         location = $9, status = 'completed'
       WHERE id = $1
       RETURNING *`,
            [
                candidateId,
                data.name,
                data.email,
                data.phone,
                data.skills,
                data.experience_years,
                data.education,
                data.companies,
                data.location,
            ]
        );
        return result.rows[0];
    }

    /**
     * Mark a candidate as failed.
     * @param {string} candidateId
     * @param {string} errorMessage
     * @returns {Promise<object>}
     */
    async markCandidateFailed(candidateId, errorMessage) {
        const result = await this._pool.query(
            `UPDATE candidates SET status = 'failed', error_message = $2
       WHERE id = $1 RETURNING *`,
            [candidateId, errorMessage]
        );
        return result.rows[0];
    }

    /**
     * Get all candidates for a batch.
     * @param {string} batchId
     * @returns {Promise<object[]>}
     */
    async getCandidatesByBatchId(batchId) {
        const result = await this._pool.query(
            'SELECT * FROM candidates WHERE batch_id = $1 ORDER BY created_at',
            [batchId]
        );
        return result.rows;
    }

    /**
     * Get batch status summary (counts by candidate status).
     * @param {string} batchId
     * @returns {Promise<object>}
     */
    async getBatchStatusSummary(batchId) {
        const result = await this._pool.query(
            `SELECT
         COUNT(*) FILTER (WHERE status = 'completed') AS completed,
         COUNT(*) FILTER (WHERE status = 'failed') AS failed,
         COUNT(*) FILTER (WHERE status = 'pending') AS pending,
         COUNT(*) FILTER (WHERE status = 'processing') AS processing,
         COUNT(*) AS total
       FROM candidates WHERE batch_id = $1`,
            [batchId]
        );
        return result.rows[0];
    }
}

module.exports = { BatchRepository };
