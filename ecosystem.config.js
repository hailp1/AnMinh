module.exports = {
    apps: [
        {
            name: "AM-Medtech-Landing",
            cwd: "./am-medtech-web",
            script: "npm",
            args: "start",
            env: {
                PORT: 3000,
                NODE_ENV: "production"
            }
        },
        {
            name: "AM-DMS-Client",
            cwd: "./client",
            script: "npm",
            args: "start",
            env: {
                PORT: 3099
            }
        },
        {
            name: "AM-Backend-API",
            cwd: "./",
            script: "npm",
            args: "run start:backend",
            env: {
                PORT: 5000
            }
        }
    ]
};
