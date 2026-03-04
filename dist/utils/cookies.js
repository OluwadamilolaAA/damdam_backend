"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRefreshTokenCookie = exports.setRefreshTokenCookie = void 0;
const env_1 = require("../config/env");
const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env_1.env.isProduction,
        sameSite: env_1.env.isProduction ? "none" : "lax",
        maxAge: refreshTokenMaxAge,
        path: "/api/auth",
    });
};
exports.setRefreshTokenCookie = setRefreshTokenCookie;
const clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env_1.env.isProduction,
        sameSite: env_1.env.isProduction ? "none" : "lax",
        path: "/api/auth",
    });
};
exports.clearRefreshTokenCookie = clearRefreshTokenCookie;
