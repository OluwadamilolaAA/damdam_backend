"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUpdateOrderStatusDto = exports.parseCreateOrderDto = void 0;
const order_model_1 = require("../Order/order.model");
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const createOrderSchema = zod_1.z.object({
    notes: zod_1.z.string().trim().min(1, "notes is required").optional(),
});
const updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(order_model_1.OrderStatus, {
        error: "status must be one of: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED",
    }),
});
const parseCreateOrderDto = (body) => {
    return (0, zod_2.parseWithSchema)(createOrderSchema, body ?? {});
};
exports.parseCreateOrderDto = parseCreateOrderDto;
const parseUpdateOrderStatusDto = (body) => {
    return (0, zod_2.parseWithSchema)(updateOrderStatusSchema, body);
};
exports.parseUpdateOrderStatusDto = parseUpdateOrderStatusDto;
