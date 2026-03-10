"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.getMyCart = void 0;
const product_model_1 = __importDefault(require("../Product/product.model"));
const cart_repository_1 = require("./cart.repository");
const api_error_1 = require("../utils/api-error");
const getOrCreateCart = async (userId) => {
    const existing = await cart_repository_1.cartRepository.findByUserId(userId);
    if (existing) {
        return existing;
    }
    return cart_repository_1.cartRepository.createForUser(userId);
};
const getMyCart = async (userId) => {
    const cart = await cart_repository_1.cartRepository.findByUserIdWithProducts(userId);
    if (!cart) {
        return { items: [] };
    }
    return cart;
};
exports.getMyCart = getMyCart;
const addItemToCart = async (userId, productId, quantity) => {
    const product = await product_model_1.default.findById(productId).exec();
    if (!product || !product.isActive) {
        throw new api_error_1.ApiError(404, "Product not found");
    }
    if (quantity > product.stock) {
        throw new api_error_1.ApiError(400, "Requested quantity exceeds available stock");
    }
    const cart = await getOrCreateCart(userId);
    const existing = cart.items.find((item) => item.productId.toString() === productId);
    if (existing) {
        const nextQuantity = existing.quantity + quantity;
        if (nextQuantity > product.stock) {
            throw new api_error_1.ApiError(400, "Requested quantity exceeds available stock");
        }
        existing.quantity = nextQuantity;
    }
    else {
        cart.items.push({
            productId: product._id,
            quantity,
        });
    }
    await cart.save();
    return cart_repository_1.cartRepository.findByUserIdWithProducts(userId);
};
exports.addItemToCart = addItemToCart;
const updateCartItem = async (userId, productId, quantity) => {
    const product = await product_model_1.default.findById(productId).exec();
    if (!product || !product.isActive) {
        throw new api_error_1.ApiError(404, "Product not found");
    }
    if (quantity > product.stock) {
        throw new api_error_1.ApiError(400, "Requested quantity exceeds available stock");
    }
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((row) => row.productId.toString() === productId);
    if (!item) {
        throw new api_error_1.ApiError(404, "Item not found in cart");
    }
    item.quantity = quantity;
    await cart.save();
    return cart_repository_1.cartRepository.findByUserIdWithProducts(userId);
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (userId, productId) => {
    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await cart.save();
    return cart_repository_1.cartRepository.findByUserIdWithProducts(userId);
};
exports.removeCartItem = removeCartItem;
const clearCart = async (userId) => {
    const cart = await cart_repository_1.cartRepository.clear(userId);
    if (!cart) {
        return { items: [] };
    }
    return cart;
};
exports.clearCart = clearCart;
