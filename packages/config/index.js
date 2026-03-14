'use strict';

const path = require('path');
const Joi = require('joi');

// Load .env from monorepo root
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  API_KEY: Joi.string().required(),

  // Database
  DATABASE_URL: Joi.string().required(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().default('resume_etl'),
  DB_USER: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),

  // Redis
  REDIS_URL: Joi.string().required(),

  // Storage
  STORAGE_PROVIDER: Joi.string().valid('s3', 'r2', 'minio').default('s3'),
  S3_ENDPOINT: Joi.string().allow('').default(''),
  S3_BUCKET: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_REGION: Joi.string().default('us-east-1'),
  S3_FORCE_PATH_STYLE: Joi.boolean().default(false),

  // AI Provider
  AI_PROVIDER: Joi.string().valid('ollama', 'openai', 'gemini').default('ollama'),
  OLLAMA_BASE_URL: Joi.string().default('http://localhost:11434'),
  OLLAMA_MODEL: Joi.string().default('llama3.1'),
  OPENAI_API_KEY: Joi.string().allow('').default(''),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  GEMINI_API_KEY: Joi.string().allow('').default(''),
  GEMINI_MODEL: Joi.string().default('gemini-1.5-flash'),

  // Worker
  WORKER_CONCURRENCY: Joi.number().default(4),
  MAX_RETRIES: Joi.number().default(3),
  JOB_TIMEOUT: Joi.number().default(120000),

  // Limits
  MAX_FILE_SIZE_MB: Joi.number().default(10),
  MAX_FILES_PER_BATCH: Joi.number().default(1000),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  const messages = error.details.map((d) => d.message).join('\n  ');
  throw new Error(`Config validation error:\n  ${messages}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  apiKey: envVars.API_KEY,

  db: {
    url: envVars.DATABASE_URL,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
  },

  redis: {
    url: envVars.REDIS_URL,
  },

  storage: {
    provider: envVars.STORAGE_PROVIDER,
    s3: {
      endpoint: envVars.S3_ENDPOINT,
      bucket: envVars.S3_BUCKET,
      accessKey: envVars.S3_ACCESS_KEY,
      secretKey: envVars.S3_SECRET_KEY,
      region: envVars.S3_REGION,
      forcePathStyle: envVars.S3_FORCE_PATH_STYLE,
    },
  },

  ai: {
    provider: envVars.AI_PROVIDER,
    ollama: {
      baseUrl: envVars.OLLAMA_BASE_URL,
      model: envVars.OLLAMA_MODEL,
    },
    openai: {
      apiKey: envVars.OPENAI_API_KEY,
      model: envVars.OPENAI_MODEL,
    },
    gemini: {
      apiKey: envVars.GEMINI_API_KEY,
      model: envVars.GEMINI_MODEL,
    },
  },

  worker: {
    concurrency: envVars.WORKER_CONCURRENCY,
    maxRetries: envVars.MAX_RETRIES,
    jobTimeout: envVars.JOB_TIMEOUT,
  },

  limits: {
    maxFileSizeMb: envVars.MAX_FILE_SIZE_MB,
    maxFilesPerBatch: envVars.MAX_FILES_PER_BATCH,
  },

  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
};

module.exports = config;
