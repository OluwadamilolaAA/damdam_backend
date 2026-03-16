"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUpdateCartItemDto = exports.parseAddCartItemDto = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const addCartItemSchema = zod_1.z.object({
    productId: zod_1.z
        .string()
        .trim()
        .refine((value) => mongoose_1.Types.ObjectId.isValid(value), "productId must be a valid id"),
    quantity: zod_1.z
        .number()
        .refine((value) => Number.isInteger(value) && value > 0, "quantity must be a positive integer"),
});
const updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z
        .number()
        .refine((value) => Number.isInteger(value) && value > 0, "quantity must be a positive integer"),
});
const parseAddCartItemDto = (body) => {
    return (0, zod_2.parseWithSchema)(addCartItemSchema, body);
};
exports.parseAddCartItemDto = parseAddCartItemDto;
const parseUpdateCartItemDto = (body) => {
    return (0, zod_2.parseWithSchema)(updateCartItemSchema, body);
};
exports.parseUpdateCartItemDto = parseUpdateCartItemDto;
