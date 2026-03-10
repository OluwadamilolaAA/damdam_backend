"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminUser = exports.getCurrentUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_model_1 = require("../Auth/auth.model");
const api_error_1 = require("../utils/api-error");
const getCurrentUser = async (userId) => {
    const user = await auth_model_1.UserModel.findById(userId)
        .select("-passwordHash -refreshTokenHashes -resetPasswordOtpHash -resetPasswordOtpExpiresAt")
        .exec();
    if (!user) {
        throw new api_error_1.ApiError(404, "User not found");
    }
    return user;
};
exports.getCurrentUser = getCurrentUser;
const PASSWORD_HASH_ROUNDS = 12;
const toUserId = (value) => value.toString();
const sanitizeUser = (user) => ({
    id: toUserId(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
});
const createAdminUser = async (input) => {
    const existingUser = await auth_model_1.UserModel.findOne({ email: input.email }).exec();
    if (existingUser) {
        throw new api_error_1.ApiError(409, "Email already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(input.password, PASSWORD_HASH_ROUNDS);
    const user = await auth_model_1.UserModel.create({
        name: input.name,
        email: input.email,
        passwordHash,
        role: auth_model_1.Role.ADMIN,
    });
    return sanitizeUser(user);
};
exports.createAdminUser = createAdminUser;
