"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRegisterDto = parseRegisterDto;
exports.parseLoginDto = parseLoginDto;
exports.parseForgotPasswordDto = parseForgotPasswordDto;
exports.parseResetPasswordDto = parseResetPasswordDto;
const api_error_1 = require("../utils/api-error");
const validators_1 = require("../utils/validators");
function parseRegisterDto(body) {
    const data = body;
    const password = (0, validators_1.requireString)(data.password, "password");
    if (password.length < 8) {
        throw new api_error_1.ApiError(400, "password must be at least 8 characters");
    }
    return {
        name: (0, validators_1.requireString)(data.name, "name"),
        email: (0, validators_1.requireEmail)(data.email),
        password,
    };
}
function parseLoginDto(body) {
    const data = body;
    return {
        email: (0, validators_1.requireEmail)(data.email),
        password: (0, validators_1.requireString)(data.password, "password"),
    };
}
function parseForgotPasswordDto(body) {
    const data = body;
    return {
        email: (0, validators_1.requireEmail)(data.email),
    };
}
function parseResetPasswordDto(body) {
    const data = body;
    const email = (0, validators_1.requireEmail)(data.email);
    const otp = (0, validators_1.requireString)(data.otp, "otp");
    const newPassword = (0, validators_1.requireString)(data.newPassword, "newPassword");
    if (!/^\d{6}$/.test(otp)) {
        throw new api_error_1.ApiError(400, "otp must be a 6-digit code");
    }
    if (newPassword.length < 8) {
        throw new api_error_1.ApiError(400, "newPassword must be at least 8 characters");
    }
    return { email, otp, newPassword };
}
