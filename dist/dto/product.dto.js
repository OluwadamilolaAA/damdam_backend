"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUpdateProductDto = exports.parseCreateProductDto = void 0;
const api_error_1 = require("../utils/api-error");
const validators_1 = require("../utils/validators");
const parseOptionalString = (value, field) => {
    if (value === undefined || value === null) {
        return undefined;
    }
    return (0, validators_1.requireString)(value, field);
};
const parseNonNegativeNumber = (value, field) => {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
        throw new api_error_1.ApiError(400, `${field} must be a non-negative number`);
    }
    return value;
};
const parseCreateProductDto = (body) => {
    const data = body;
    return {
        name: (0, validators_1.requireString)(data.name, "name"),
        description: parseOptionalString(data.description, "description"),
        price: parseNonNegativeNumber(data.price, "price"),
        stock: parseNonNegativeNumber(data.stock, "stock"),
        category: parseOptionalString(data.category, "category"),
    };
};
exports.parseCreateProductDto = parseCreateProductDto;
const parseUpdateProductDto = (body) => {
    const data = body;
    const payload = {};
    if (data.name !== undefined) {
        payload.name = (0, validators_1.requireString)(data.name, "name");
    }
    if (data.description !== undefined) {
        payload.description = parseOptionalString(data.description, "description");
    }
    if (data.price !== undefined) {
        payload.price = parseNonNegativeNumber(data.price, "price");
    }
    if (data.stock !== undefined) {
        payload.stock = parseNonNegativeNumber(data.stock, "stock");
    }
    if (data.category !== undefined) {
        payload.category = parseOptionalString(data.category, "category");
    }
    if (data.isActive !== undefined) {
        if (typeof data.isActive !== "boolean") {
            throw new api_error_1.ApiError(400, "isActive must be a boolean");
        }
        payload.isActive = data.isActive;
    }
    if (Object.keys(payload).length === 0) {
        throw new api_error_1.ApiError(400, "At least one field is required for update");
    }
    return payload;
};
exports.parseUpdateProductDto = parseUpdateProductDto;
