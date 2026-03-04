"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireString = requireString;
exports.requireEmail = requireEmail;
exports.requireEnum = requireEnum;
exports.requireObjectId = requireObjectId;
exports.requirePositiveInt = requirePositiveInt;
const api_error_1 = require("./api-error");
const mongoose_1 = require("mongoose");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function requireString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new api_error_1.ApiError(400, `${field} is required`);
    }
    return value.trim();
}
function requireEmail(value) {
    const email = requireString(value, "email").toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
        throw new api_error_1.ApiError(400, "A valid email is required");
    }
    return email;
}
function requireEnum(value, allowed, field) {
    if (typeof value !== "string" || !allowed.includes(value)) {
        throw new api_error_1.ApiError(400, `${field} must be one of: ${allowed.join(", ")}`);
    }
    return value;
}
function requireObjectId(value, field) {
    const raw = requireString(value, field);
    if (!mongoose_1.Types.ObjectId.isValid(raw)) {
        throw new api_error_1.ApiError(400, `${field} must be a valid id`);
    }
    return raw;
}
function requirePositiveInt(value, field) {
    if (typeof value !== "number" ||
        Number.isNaN(value) ||
        !Number.isInteger(value) ||
        value < 1) {
        throw new api_error_1.ApiError(400, `${field} must be a positive integer`);
    }
    return value;
}
