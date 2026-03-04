"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dns_1 = __importDefault(require("dns"));
const env_1 = require("../config/env");
const smtpConfigured = Boolean(env_1.env.smtpHost && env_1.env.smtpPort && env_1.env.smtpUser && env_1.env.smtpPass);
try {
    dns_1.default.setDefaultResultOrder?.("ipv4first");
}
catch (err) {
    // ignore
}
const transporter = smtpConfigured
    ? nodemailer_1.default.createTransport({
        host: env_1.env.smtpHost,
        port: env_1.env.smtpPort,
        secure: env_1.env.smtpSecure,
        auth: {
            user: env_1.env.smtpUser,
            pass: env_1.env.smtpPass,
        },
    })
    : nodemailer_1.default.createTransport({
        jsonTransport: true,
    });
const sendPasswordResetOtpEmail = async (email, name, otpCode) => {
    const info = await transporter.sendMail({
        from: env_1.env.smtpFrom,
        to: email,
        subject: "Your password reset OTP",
        text: `Hi ${name}, your password reset OTP is ${otpCode}. It expires in ${env_1.env.passwordResetTtlMinutes} minutes.`,
    });
    if (!smtpConfigured) {
        console.log("Password reset OTP email preview:", info.message);
    }
};
exports.sendPasswordResetOtpEmail = sendPasswordResetOtpEmail;
