import app from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import mongoose from "mongoose";

async function bootstrap(): Promise<void> {
  await connectDb();
  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  // FIX: Handle graceful shutdown correctly to prevent connection leaks
  const shutdown = async () => {
    console.log("Shutting down gracefully...");
    server.close(async () => {
      console.log("Closed out remaining server connections.");
      await mongoose.connection.close();
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
