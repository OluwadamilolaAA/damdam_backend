"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminHandler = exports.meHandler = void 0;
const user_dto_1 = require("./user.dto");
const user_service_1 = require("./user.service");
const async_handler_1 = require("../utils/async-handler");
const api_error_1 = require("../utils/api-error");
exports.meHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const userId = req.authUser?.userId;
    if (!userId) {
        throw new api_error_1.ApiError(401, "Unauthorized");
    }
    const user = await (0, user_service_1.getCurrentUser)(userId);
    res.status(200).json({ user });
});
exports.createAdminHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, user_dto_1.parseCreateAdminDto)(req.body);
    const user = await (0, user_service_1.createAdminUser)(payload);
    res.status(201).json({
        message: "Admin account created successfully",
        user,
    });
});
