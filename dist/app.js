"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = require("./config/passport");
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./Auth/auth.routes"));
const cart_routes_1 = __importDefault(require("./Cart/cart.routes"));
const docs_routes_1 = __importDefault(require("./routes/docs.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const order_routes_1 = __importDefault(require("./Order/order.routes"));
const product_routes_1 = __importDefault(require("./Product/product.routes"));
const user_routes_1 = __importDefault(require("./User/user.routes"));
const app = (0, express_1.default)();
(0, passport_2.initializePassport)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.clientOrigin,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use("/api/health", health_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/cart", cart_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api", docs_routes_1.default);
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
