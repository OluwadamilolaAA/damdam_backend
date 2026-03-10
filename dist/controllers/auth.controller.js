"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthCallbackHandler = exports.googleAuthHandler = exports.resetPasswordHandler = exports.forgotPasswordHandler = exports.logoutHandler = exports.refreshHandler = exports.loginHandler = exports.registerHandler = void 0;
const passport_1 = __importDefault(require("passport"));
const auth_dto_1 = require("../dto/auth.dto");
const async_handler_1 = require("../utils/async-handler");
const api_error_1 = require("../utils/api-error");
const cookies_1 = require("../utils/cookies");
const auth_service_1 = require("../services/auth.service");
const env_1 = require("../config/env");
const passport_2 = require("../config/passport");
const token_1 = require("../utils/token");
exports.registerHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_dto_1.parseRegisterDto)(req.body);
    const result = await (0, auth_service_1.register)(payload);
    res.status(201).json({
        message: "Registration successful. Please login.",
        user: result.user,
    });
});
exports.loginHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_dto_1.parseLoginDto)(req.body);
    const result = await (0, auth_service_1.login)(payload);
    (0, cookies_1.setRefreshTokenCookie)(res, result.refreshToken);
    res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
    });
});
exports.refreshHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        throw new api_error_1.ApiError(401, "Missing refresh token cookie");
    }
    const result = await (0, auth_service_1.refresh)(refreshToken);
    (0, cookies_1.setRefreshTokenCookie)(res, result.refreshToken);
    res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
    });
});
exports.logoutHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        try {
            const payload = (0, token_1.verifyRefreshToken)(refreshToken);
            await (0, auth_service_1.logout)(payload.sub);
        }
        catch {
        }
    }
    (0, cookies_1.clearRefreshTokenCookie)(res);
    res.status(200).json({ message: "Logged out successfully" });
});
exports.forgotPasswordHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_dto_1.parseForgotPasswordDto)(req.body);
    await (0, auth_service_1.forgotPassword)(payload.email);
    res.status(200).json({
        message: "If that email exists, a reset OTP has been sent.",
    });
});
exports.resetPasswordHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, auth_dto_1.parseResetPasswordDto)(req.body);
    await (0, auth_service_1.resetPassword)(payload.email, payload.otp, payload.newPassword);
    res.status(200).json({
        message: "Password reset successful. Please login again.",
    });
});
const buildRedirectUrl = (baseUrl, params) => {
    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    return url.toString();
};
const googleAuthHandler = (req, res, next) => {
    (0, passport_2.ensureGoogleOAuthConfigured)();
    return passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })(req, res, next);
};
exports.googleAuthHandler = googleAuthHandler;
const googleAuthCallbackHandler = (req, res, next) => {
    (0, passport_2.ensureGoogleOAuthConfigured)();
    return passport_1.default.authenticate("google", { session: false }, async (error, profile) => {
        if (error || !profile) {
            const failureUrl = buildRedirectUrl(env_1.env.googleAuthFailureRedirect, {
                error: "google_auth_failed",
            });
            res.redirect(302, failureUrl);
            return;
        }
        try {
            const googleProfile = profile;
            const email = googleProfile.emails?.[0]?.value;
            if (!googleProfile.id || !email) {
                throw new api_error_1.ApiError(400, "Google account email is required");
            }
            const result = await (0, auth_service_1.loginWithGoogle)({
                googleId: googleProfile.id,
                email,
                name: googleProfile.displayName || email.split("@")[0],
            });
            (0, cookies_1.setRefreshTokenCookie)(res, result.refreshToken);
            const successUrl = env_1.env.googleAuthSuccessRedirect;
            res.redirect(302, successUrl);
        }
        catch (_err) {
            const failureUrl = buildRedirectUrl(env_1.env.googleAuthFailureRedirect, {
                error: "google_auth_failed",
            });
            res.redirect(302, failureUrl);
        }
    })(req, res, next);
};
exports.googleAuthCallbackHandler = googleAuthCallbackHandler;
