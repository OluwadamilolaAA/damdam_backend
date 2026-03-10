import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import passport from "passport";
import { initializePassport } from "./config/passport";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import authRoutes from "./Auth/auth.routes";
import cartRoutes from "./Cart/cart.routes";
import docsRoutes from "./routes/docs.routes";
import healthRoutes from "./routes/health.routes";
import orderRoutes from "./Order/order.routes";
import productRoutes from "./Product/product.routes";
import userRoutes from "./User/user.routes";

const app = express();
initializePassport();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", docsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
