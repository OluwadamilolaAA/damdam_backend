"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.loginWithGoogle = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const auth_model_1 = require("./auth.model");
const env_1 = require("../config/env");
const api_error_1 = require("../utils/api-error");
const email_1 = require("../utils/email");
const token_1 = require("../utils/token");
const MAX_REFRESH_TOKENS_PER_USER = 5;
const REFRESH_HASH_ROUNDS = 12;
const PASSWORD_HASH_ROUNDS = 12;
const toUserId = (value) => value.toString();
const sanitizeUser = (user) => ({
    id: toUserId(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
});
const issueTokens = async (user) => {
    const payload = { sub: toUserId(user._id), role: user.role };
    const accessToken = (0, token_1.generateAccessToken)(payload);
    const refreshToken = (0, token_1.generateRefreshToken)(payload);
    const refreshTokenHash = await bcrypt_1.default.hash(refreshToken, REFRESH_HASH_ROUNDS);
    const nextRefreshTokenHashes = [refreshTokenHash, ...user.refreshTokenHashes].slice(0, MAX_REFRESH_TOKENS_PER_USER);
    const updatedUser = await auth_model_1.UserModel.findByIdAndUpdate(user._id, { $set: { refreshTokenHashes: nextRefreshTokenHashes } }, { returnDocument: 'after' }).exec();
    if (!updatedUser) {
        throw new api_error_1.ApiError(404, "User not found");
    }
    return {
        accessToken,
        refreshToken,
        user: sanitizeUser(updatedUser),
    };
};
const register = async (input) => {
    const existingUser = await auth_model_1.UserModel.findOne({ email: input.email }).exec();
    if (existingUser) {
        throw new api_error_1.ApiError(409, "Email already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, PASSWORD_HASH_ROUNDS);
    const user = await auth_model_1.UserModel.create({
        name: input.name,
        email: input.email,
        passwordHash,
        role: auth_model_1.Role.USER,
    });
    return {
        user: sanitizeUser(user),
    };
};
exports.register = register;
const login = async (input) => {
    const user = await auth_model_1.UserModel.findOne({ email: input.email }).exec();
    if (!user) {
        throw new api_error_1.ApiError(401, "Invalid email or password");
    }
    if (!user.passwordHash) {
        throw new api_error_1.ApiError(401, "Use Google login for this account");
    }
    const isPasswordValid = await bcrypt_1.default.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
        throw new api_error_1.ApiError(401, "Invalid email or password");
    }
    return issueTokens(user);
};
exports.login = login;
const loginWithGoogle = async (profile) => {
    let user = await auth_model_1.UserModel.findOne({ googleId: profile.googleId }).exec();
    if (!user) {
        user = await auth_model_1.UserModel.findOne({ email: profile.email }).exec();
    }
    if (!user) {
        user = await auth_model_1.UserModel.create({
            name: profile.name,
            email: profile.email,
            googleId: profile.googleId,
            role: auth_model_1.Role.USER,
        });
    }
    else if (!user.googleId) {
        user.googleId = profile.googleId;
        if (!user.name) {
            user.name = profile.name;
        }
        await user.save();
    }
    return issueTokens(user);
};
exports.loginWithGoogle = loginWithGoogle;
const refresh = async (incomingRefreshToken) => {
    const payload = (0, token_1.verifyRefreshToken)(incomingRefreshToken);
    const user = await auth_model_1.UserModel.findById(payload.sub).exec();
    if (!user || user.refreshTokenHashes.length === 0) {
        throw new api_error_1.ApiError(401, "Invalid refresh token");
    }
    let isMatch = false;
    for (const tokenHash of user.refreshTokenHashes) {
        if (await bcrypt_1.default.compare(incomingRefreshToken, tokenHash)) {
            isMatch = true;
            break;
        }
    }
    if (!isMatch) {
        throw new api_error_1.ApiError(401, "Invalid refresh token");
    }
    // Token rotation: remove old token hashes and keep only fresh ones.
    user.refreshTokenHashes = [];
    return issueTokens(user);
};
exports.refresh = refresh;
const logout = async (userId) => {
    await auth_model_1.UserModel.findByIdAndUpdate(userId, { $set: { refreshTokenHashes: [] } }).exec();
};
exports.logout = logout;
const hashOtp = (otp) => crypto_1.default.createHash("sha256").update(otp).digest("hex");
const generateOtpCode = () => crypto_1.default.randomInt(0, 1000000).toString().padStart(6, "0");
const forgotPassword = async (email) => {
    const user = await auth_model_1.UserModel.findOne({ email }).exec();
    // Always return success to avoid leaking whether an account exists.
    if (!user || !user.passwordHash) {
        return;
    }
    const otpCode = generateOtpCode();
    user.resetPasswordOtpHash = hashOtp(otpCode);
    user.resetPasswordOtpExpiresAt = new Date(Date.now() + env_1.env.passwordResetTtlMinutes * 60 * 1000);
    await user.save();
    await (0, email_1.sendPasswordResetOtpEmail)(user.email, user.name, otpCode);
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (email, otp, newPassword) => {
    const otpHash = hashOtp(otp);
    const user = await auth_model_1.UserModel.findOne({
        email,
        resetPasswordOtpHash: otpHash,
        resetPasswordOtpExpiresAt: { $gt: new Date() },
    }).exec();
    if (!user) {
        throw new api_error_1.ApiError(400, "Invalid or expired OTP");
    }
    user.passwordHash = await bcrypt_1.default.hash(newPassword, PASSWORD_HASH_ROUNDS);
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordOtpExpiresAt = undefined;
    user.refreshTokenHashes = [];
    await user.save();
};
exports.resetPassword = resetPassword;
