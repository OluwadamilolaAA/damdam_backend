"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = void 0;
const user_model_1 = require("../models/user.model");
const api_error_1 = require("../utils/api-error");
const getCurrentUser = async (userId) => {
    const user = await user_model_1.UserModel.findById(userId)
        .select("-passwordHash -refreshTokenHashes -resetPasswordOtpHash -resetPasswordOtpExpiresAt")
        .exec();
    if (!user) {
        throw new api_error_1.ApiError(404, "User not found");
    }
    return user;
};
exports.getCurrentUser = getCurrentUser;
