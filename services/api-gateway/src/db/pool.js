'use strict';

const { Pool } = require('pg');

/**
 * Creates a pg Pool from config.
 * @param {object} dbConfig
 * @returns {Pool}
 */
function createPool(dbConfig) {
    return new Pool({
        connectionString: dbConfig.url,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });
}

module.exports = { createPool };
