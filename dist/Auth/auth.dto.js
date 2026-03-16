"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRegisterDto = parseRegisterDto;
exports.parseLoginDto = parseLoginDto;
exports.parseForgotPasswordDto = parseForgotPasswordDto;
exports.parseResetPasswordDto = parseResetPasswordDto;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "name is required"),
    email: zod_1.z.string().trim().email("A valid email is required").toLowerCase(),
    password: zod_1.z.string().trim().min(8, "password must be at least 8 characters"),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("A valid email is required").toLowerCase(),
    password: zod_1.z.string().trim().min(1, "password is required"),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("A valid email is required").toLowerCase(),
});
const resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("A valid email is required").toLowerCase(),
    otp: zod_1.z.string().trim().regex(/^\d{6}$/, "otp must be a 6-digit code"),
    newPassword: zod_1.z
        .string()
        .trim()
        .min(8, "newPassword must be at least 8 characters"),
});
function parseRegisterDto(body) {
    return (0, zod_2.parseWithSchema)(registerSchema, body);
}
function parseLoginDto(body) {
    return (0, zod_2.parseWithSchema)(loginSchema, body);
}
function parseForgotPasswordDto(body) {
    return (0, zod_2.parseWithSchema)(forgotPasswordSchema, body);
}
function parseResetPasswordDto(body) {
    return (0, zod_2.parseWithSchema)(resetPasswordSchema, body);
}
