"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many auth requests. Please try again later.",
    },
});
router.post("/register", authLimiter, auth_controller_1.registerHandler);
router.post("/login", authLimiter, auth_controller_1.loginHandler);
router.post("/refresh", authLimiter, auth_controller_1.refreshHandler);
router.post("/logout", auth_controller_1.logoutHandler);
router.post("/forgot-password", authLimiter, auth_controller_1.forgotPasswordHandler);
router.post("/reset-password", authLimiter, auth_controller_1.resetPasswordHandler);
router.get("/google", auth_controller_1.googleAuthHandler);
router.get("/google/callback", auth_controller_1.googleAuthCallbackHandler);
exports.default = router;
