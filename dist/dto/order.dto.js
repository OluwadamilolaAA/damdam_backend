"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUpdateOrderStatusDto = exports.parseCreateOrderDto = void 0;
const order_model_1 = require("../models/order.model");
const api_error_1 = require("../utils/api-error");
const validators_1 = require("../utils/validators");
const parseCreateOrderDto = (body) => {
    const data = (body ?? {});
    if (data.notes === undefined || data.notes === null) {
        return {};
    }
    return { notes: (0, validators_1.requireString)(data.notes, "notes") };
};
exports.parseCreateOrderDto = parseCreateOrderDto;
const parseUpdateOrderStatusDto = (body) => {
    const data = body;
    if (data.status === undefined || data.status === null) {
        throw new api_error_1.ApiError(400, "status is required");
    }
    return {
        status: (0, validators_1.requireEnum)(data.status, Object.values(order_model_1.OrderStatus), "status"),
    };
};
exports.parseUpdateOrderStatusDto = parseUpdateOrderStatusDto;
