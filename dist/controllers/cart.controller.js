"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartHandler = exports.removeCartItemHandler = exports.updateCartItemHandler = exports.addCartItemHandler = exports.getMyCartHandler = void 0;
const cart_dto_1 = require("../dto/cart.dto");
const cart_service_1 = require("../services/cart.service");
const async_handler_1 = require("../utils/async-handler");
const api_error_1 = require("../utils/api-error");
const validators_1 = require("../utils/validators");
const getRequestUserId = (req) => {
    const userId = req.authUser?.userId;
    if (!userId) {
        throw new api_error_1.ApiError(401, "Unauthorized");
    }
    return userId;
};
exports.getMyCartHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const cart = await (0, cart_service_1.getMyCart)(getRequestUserId(req));
    res.status(200).json({ cart });
});
exports.addCartItemHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, cart_dto_1.parseAddCartItemDto)(req.body);
    const cart = await (0, cart_service_1.addItemToCart)(getRequestUserId(req), payload.productId, payload.quantity);
    res.status(200).json({ cart });
});
exports.updateCartItemHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, cart_dto_1.parseUpdateCartItemDto)(req.body);
    const productId = (0, validators_1.requireObjectId)(req.params.productId, "productId");
    const cart = await (0, cart_service_1.updateCartItem)(getRequestUserId(req), productId, payload.quantity);
    res.status(200).json({ cart });
});
exports.removeCartItemHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const productId = (0, validators_1.requireObjectId)(req.params.productId, "productId");
    const cart = await (0, cart_service_1.removeCartItem)(getRequestUserId(req), productId);
    res.status(200).json({ cart });
});
exports.clearCartHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const cart = await (0, cart_service_1.clearCart)(getRequestUserId(req));
    res.status(200).json({ cart });
});
