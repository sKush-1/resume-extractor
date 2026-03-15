module.exports = {
    apps: [
        {
            name: "ffbackend",
            script: "dist/server.js",
            instances: 1,
            exec_mode: "fork",

            watch: false,

            autorestart: true,
            max_memory_restart: "1G",

            error_file: "./error.log",
            out_file: "./combined.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss"
        }
    ]
};
