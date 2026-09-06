module.exports = {
    apps: [
        {
            name: "bulkparser-api",
            script: "dist/server.js",
            instances: 1,
            exec_mode: "fork",

            watch: false,

            autorestart: true,
            max_memory_restart: "1G",

            error_file: "./logs/error.log",
            out_file: "./logs/combined.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss"
        }
    ]
};

