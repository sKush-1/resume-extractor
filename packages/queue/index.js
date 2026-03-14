'use strict';

const { Queue, Worker } = require('bullmq');
const { createLogger } = require('@resume-etl/logger');

const logger = createLogger('queue');

const QUEUE_NAMES = {
    RESUME_PARSE: 'resume-parse',
    EXPORT: 'export',
};

/**
 * Parses a Redis URL into an IORedis-compatible connection object.
 * @param {string} redisUrl - e.g., redis://localhost:6379
 * @returns {object}
 */
function parseRedisUrl(redisUrl) {
    const url = new URL(redisUrl);
    return {
        host: url.hostname,
        port: parseInt(url.port, 10) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: null,
    };
}

/**
 * Queue provider wrapping BullMQ.
 */
class QueueProvider {
    /**
     * @param {string} redisUrl
     */
    constructor(redisUrl) {
        this._connection = parseRedisUrl(redisUrl);
        this._queues = {};
    }

    /**
     * Get or create a BullMQ Queue by name.
     * @param {string} queueName
     * @returns {Queue}
     */
    _getQueue(queueName) {
        if (!this._queues[queueName]) {
            this._queues[queueName] = new Queue(queueName, {
                connection: this._connection,
            });
        }
        return this._queues[queueName];
    }

    /**
     * Add a job to a queue.
     * @param {string} queueName - Queue name from QUEUE_NAMES
     * @param {object} data - Job payload
     * @param {object} [options] - BullMQ job options
     * @returns {Promise<import('bullmq').Job>}
     */
    async addJob(queueName, data, options = {}) {
        const queue = this._getQueue(queueName);
        const defaultOptions = {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: { count: 1000 },
            removeOnFail: { count: 5000 },
        };

        const job = await queue.add(queueName, data, {
            ...defaultOptions,
            ...options,
        });

        logger.debug('Job added to queue', {
            queueName,
            jobId: job.id,
            batchId: data.batch_id,
        });

        return job;
    }

    /**
     * Add multiple jobs to a queue in bulk.
     * @param {string} queueName
     * @param {object[]} dataArray - Array of job payloads
     * @returns {Promise<import('bullmq').Job[]>}
     */
    async addBulkJobs(queueName, dataArray) {
        const queue = this._getQueue(queueName);
        const jobs = dataArray.map((data) => ({
            name: queueName,
            data,
            opts: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: { count: 1000 },
                removeOnFail: { count: 5000 },
            },
        }));

        const result = await queue.addBulk(jobs);

        logger.info('Bulk jobs added to queue', {
            queueName,
            count: result.length,
        });

        return result;
    }

    /**
     * Create a worker that consumes jobs from a queue.
     * @param {string} queueName
     * @param {function} processor - Async function (job) => result
     * @param {object} [options]
     * @param {number} [options.concurrency=1]
     * @returns {Worker}
     */
    createWorker(queueName, processor, options = {}) {
        const worker = new Worker(queueName, processor, {
            connection: this._connection,
            concurrency: options.concurrency || 1,
        });

        worker.on('completed', (job) => {
            logger.debug('Job completed', { queueName, jobId: job.id });
        });

        worker.on('failed', (job, err) => {
            logger.error('Job failed', {
                queueName,
                jobId: job?.id,
                error: err.message,
                stack: err.stack,
            });
        });

        worker.on('error', (err) => {
            logger.error('Worker error', { queueName, error: err.message });
        });

        return worker;
    }

    /**
     * Get counts for a queue (waiting, active, completed, failed, delayed).
     * @param {string} queueName
     * @returns {Promise<object>}
     */
    async getQueueCounts(queueName) {
        const queue = this._getQueue(queueName);
        return queue.getJobCounts(
            'waiting',
            'active',
            'completed',
            'failed',
            'delayed'
        );
    }

    /**
     * Close all queue connections gracefully.
     * @returns {Promise<void>}
     */
    async close() {
        const closePromises = Object.values(this._queues).map((q) => q.close());
        await Promise.all(closePromises);
        logger.info('All queue connections closed');
    }
}

/**
 * Create a queue provider instance.
 * @param {string} redisUrl
 * @returns {QueueProvider}
 */
function createQueueProvider(redisUrl) {
    return new QueueProvider(redisUrl);
}

module.exports = { QueueProvider, createQueueProvider, QUEUE_NAMES };
