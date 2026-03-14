'use strict';

/**
 * @typedef {Object} StorageProvider
 * @property {function(string, Buffer, string): Promise<string>} uploadFile
 * @property {function(string): Promise<Buffer>} getFile
 * @property {function(string): Promise<void>} deleteFile
 * @property {function(string, number): Promise<string>} getSignedUrl
 */

/**
 * S3-compatible storage adapter.
 * Works with AWS S3, MinIO, and Cloudflare R2.
 */
class S3Adapter {
    /**
     * @param {object} config
     * @param {string} config.bucket
     * @param {string} config.accessKey
     * @param {string} config.secretKey
     * @param {string} config.region
     * @param {string} [config.endpoint]
     * @param {boolean} [config.forcePathStyle]
     */
    constructor(config) {
        const {
            S3Client,
            PutObjectCommand,
            GetObjectCommand,
            DeleteObjectCommand,
        } = require('@aws-sdk/client-s3');
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

        this._bucket = config.bucket;
        this._getSignedUrl = getSignedUrl;
        this._PutObjectCommand = PutObjectCommand;
        this._GetObjectCommand = GetObjectCommand;
        this._DeleteObjectCommand = DeleteObjectCommand;

        const s3Config = {
            region: config.region || 'us-east-1',
            credentials: {
                accessKeyId: config.accessKey,
                secretAccessKey: config.secretKey,
            },
        };

        if (config.endpoint) {
            s3Config.endpoint = config.endpoint;
        }

        if (config.forcePathStyle) {
            s3Config.forcePathStyle = true;
        }

        this._client = new S3Client(s3Config);
    }

    /**
     * Upload a file to S3.
     * @param {string} key - Object key (path in bucket)
     * @param {Buffer} body - File content
     * @param {string} contentType - MIME type
     * @returns {Promise<string>} The object key
     */
    async uploadFile(key, body, contentType) {
        const command = new this._PutObjectCommand({
            Bucket: this._bucket,
            Key: key,
            Body: body,
            ContentType: contentType,
        });

        await this._client.send(command);
        return key;
    }

    /**
     * Download a file from S3.
     * @param {string} key - Object key
     * @returns {Promise<Buffer>}
     */
    async getFile(key) {
        const command = new this._GetObjectCommand({
            Bucket: this._bucket,
            Key: key,
        });

        const response = await this._client.send(command);
        return this._streamToBuffer(response.Body);
    }

    /**
     * Delete a file from S3.
     * @param {string} key - Object key
     * @returns {Promise<void>}
     */
    async deleteFile(key) {
        const command = new this._DeleteObjectCommand({
            Bucket: this._bucket,
            Key: key,
        });

        await this._client.send(command);
    }

    /**
     * Generate a pre-signed download URL.
     * @param {string} key - Object key
     * @param {number} [expiresIn=3600] - URL validity in seconds
     * @returns {Promise<string>}
     */
    async getSignedUrl(key, expiresIn = 3600) {
        const command = new this._GetObjectCommand({
            Bucket: this._bucket,
            Key: key,
        });

        return this._getSignedUrl(this._client, command, { expiresIn });
    }

    /**
     * Convert a readable stream to buffer.
     * @param {import('stream').Readable} stream
     * @returns {Promise<Buffer>}
     */
    async _streamToBuffer(stream) {
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }
}

/**
 * Factory function to create a storage provider based on config.
 * All providers (s3, minio, r2) use the S3Adapter with different configs.
 *
 * @param {object} storageConfig
 * @returns {S3Adapter}
 */
function createStorageProvider(storageConfig) {
    return new S3Adapter({
        bucket: storageConfig.s3.bucket,
        accessKey: storageConfig.s3.accessKey,
        secretKey: storageConfig.s3.secretKey,
        region: storageConfig.s3.region,
        endpoint: storageConfig.s3.endpoint || undefined,
        forcePathStyle: storageConfig.s3.forcePathStyle || false,
    });
}

module.exports = { S3Adapter, createStorageProvider };
