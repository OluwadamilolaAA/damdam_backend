"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addItemToCart = exports.getMyCart = void 0;
const product_model_1 = __importDefault(require("../Product/product.model"));
const cart_repository_1 = require("./cart.repository");
const api_error_1 = require("../utils/api-error");
const cart_model_1 = require("./cart.model");
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
    // Using MongoDB array update operators for atomicity instead of fetching, modifying in-memory, and saving
    const existingCart = await cart_model_1.CartModel.findOne({ user: userId }).exec();
    if (!existingCart) {
        // No cart yet → create one
        await cart_model_1.CartModel.create({
            user: userId,
            items: [{ productId, quantity }],
        });
    }
    else {
        // Cart exists → update it
        const item = existingCart.items.find((i) => i.productId.toString() === productId);
        if (item) {
            const newQuantity = item.quantity + quantity;
            if (newQuantity > product.stock) {
                throw new api_error_1.ApiError(400, "Requested quantity exceeds available stock");
            }
            await cart_model_1.CartModel.updateOne({ user: userId, "items.productId": productId }, { $set: { "items.$.quantity": newQuantity } });
        }
        else {
            await cart_model_1.CartModel.updateOne({ user: userId }, { $push: { items: { productId, quantity } } });
        }
    }
    return cart_repository_1.cartRepository.findByUserIdWithProducts(userId);
};
exports.addItemToCart = addItemToCart;
const updateCartItem = async (userId, productId, quantity) => {
    // Check if product exists and is active
    const product = await product_model_1.default.findById(productId).exec();
    if (!product || !product.isActive) {
        throw new api_error_1.ApiError(404, "Product not found");
    }
    // Check stock availability
    if (quantity > product.stock) {
        throw new api_error_1.ApiError(400, "Requested quantity exceeds available stock");
    }
    // Atomic update
    const updatedCart = await cart_model_1.CartModel.findOneAndUpdate({ user: userId, "items.productId": productId }, { $set: { "items.$.quantity": quantity } }, {
        new: true, // return updated document
        runValidators: true // enforce schema validation
    });
    // If item not found in cart
    if (!updatedCart) {
        throw new api_error_1.ApiError(404, "Item not found in cart");
    }
    // Return cart with populated products
    return cart_repository_1.cartRepository.findByUserIdWithProducts(userId);
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (userId, productId) => {
    // Use $pull operator for atomic removal without needing to fetch and parse the array
    await cart_model_1.CartModel.updateOne({ user: userId }, { $pull: { items: { productId } } });
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
