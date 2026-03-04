"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateOrderStatusHandler = exports.adminListOrdersHandler = exports.getOrderByIdHandler = exports.myOrdersHandler = exports.createOrderHandler = void 0;
const order_dto_1 = require("../dto/order.dto");
const user_model_1 = require("../models/user.model");
const order_service_1 = require("../services/order.service");
const async_handler_1 = require("../utils/async-handler");
const api_error_1 = require("../utils/api-error");
const validators_1 = require("../utils/validators");
const getRequestUser = (req) => {
    if (!req.authUser) {
        throw new api_error_1.ApiError(401, "Unauthorized");
    }
    return req.authUser;
};
exports.createOrderHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = getRequestUser(req);
    const payload = (0, order_dto_1.parseCreateOrderDto)(req.body);
    const order = await (0, order_service_1.createOrderFromCart)(user.userId, payload.notes);
    res.status(201).json({ order });
});
exports.myOrdersHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = getRequestUser(req);
    const orders = await (0, order_service_1.getMyOrders)(user.userId);
    res.status(200).json({ orders });
});
exports.getOrderByIdHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const user = getRequestUser(req);
    const orderId = (0, validators_1.requireObjectId)(req.params.id, "id");
    if (user.role === user_model_1.Role.ADMIN) {
        const order = await (0, order_service_1.getOrderByIdForAdmin)(orderId);
        res.status(200).json({ order });
        return;
    }
    const order = await (0, order_service_1.getMyOrderById)(user.userId, orderId);
    res.status(200).json({ order });
});
exports.adminListOrdersHandler = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const orders = await (0, order_service_1.getAllOrders)();
    res.status(200).json({ orders });
});
exports.adminUpdateOrderStatusHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const orderId = (0, validators_1.requireObjectId)(req.params.id, "id");
    const payload = (0, order_dto_1.parseUpdateOrderStatusDto)(req.body);
    const order = await (0, order_service_1.updateOrderStatus)(orderId, payload.status);
    res.status(200).json({ order });
});
