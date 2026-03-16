"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const mongoose_1 = __importDefault(require("mongoose"));
async function bootstrap() {
    await (0, db_1.connectDb)();
    const server = app_1.default.listen(env_1.env.port, () => {
        console.log(`Server running on port ${env_1.env.port}`);
    });
    // Handle graceful shutdown correctly to prevent connection leaks
    const shutdown = async () => {
        console.log("Shutting down gracefully...");
        server.close(async () => {
            console.log("Closed out remaining server connections.");
            await mongoose_1.default.connection.close();
            console.log("MongoDB connection closed.");
            process.exit(0);
        });
        setTimeout(() => {
            console.error("Force shutting down after 10s");
            process.exit(1);
        }, 10000);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
