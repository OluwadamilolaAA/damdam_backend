import app from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
