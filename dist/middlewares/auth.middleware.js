"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const api_error_1 = require("../utils/api-error");
const token_1 = require("../utils/token");
const requireAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new api_error_1.ApiError(401, "Missing Bearer token");
    }
    const token = authHeader.replace("Bearer ", "").trim();
    const payload = (0, token_1.verifyAccessToken)(token);
    req.authUser = {
        userId: payload.sub,
        role: payload.role,
    };
    next();
};
exports.requireAuth = requireAuth;
const requireRole = (...allowedRoles) => (req, _res, next) => {
    if (!req.authUser) {
        throw new api_error_1.ApiError(401, "Unauthorized");
    }
    if (!allowedRoles.includes(req.authUser.role)) {
        throw new api_error_1.ApiError(403, "Forbidden");
    }
    next();
};
exports.requireRole = requireRole;
