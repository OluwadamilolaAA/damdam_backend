"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUpdateCartItemDto = exports.parseAddCartItemDto = void 0;
const validators_1 = require("../utils/validators");
const parseAddCartItemDto = (body) => {
    const data = body;
    return {
        productId: (0, validators_1.requireObjectId)(data.productId, "productId"),
        quantity: (0, validators_1.requirePositiveInt)(data.quantity, "quantity"),
    };
};
exports.parseAddCartItemDto = parseAddCartItemDto;
const parseUpdateCartItemDto = (body) => {
    const data = body;
    return {
        quantity: (0, validators_1.requirePositiveInt)(data.quantity, "quantity"),
    };
};
exports.parseUpdateCartItemDto = parseUpdateCartItemDto;
