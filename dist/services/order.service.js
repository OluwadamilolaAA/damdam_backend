"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderByIdForAdmin = exports.getAllOrders = exports.getMyOrderById = exports.getMyOrders = exports.createOrderFromCart = void 0;
const order_model_1 = require("../models/order.model");
const product_model_1 = __importDefault(require("../models/product.model"));
const order_repository_1 = require("../repositories/order.repository");
const cart_repository_1 = require("../repositories/cart.repository");
const api_error_1 = require("../utils/api-error");
const createOrderFromCart = async (userId, notes) => {
    const cart = await cart_repository_1.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
        throw new api_error_1.ApiError(400, "Cart is empty");
    }
    const orderItems = [];
    let subtotal = 0;
    for (const cartItem of cart.items) {
        const product = await product_model_1.default.findById(cartItem.productId).exec();
        if (!product || !product.isActive) {
            throw new api_error_1.ApiError(400, "One or more products in cart are unavailable");
        }
        if (cartItem.quantity > product.stock) {
            throw new api_error_1.ApiError(400, `Insufficient stock for ${product.name}`);
        }
        const lineTotal = product.price * cartItem.quantity;
        subtotal += lineTotal;
        orderItems.push({
            productId: product._id,
            name: product.name,
            unitPrice: product.price,
            quantity: cartItem.quantity,
            lineTotal,
        });
    }
    for (const cartItem of cart.items) {
        await product_model_1.default.findByIdAndUpdate(cartItem.productId, {
            $inc: { stock: -cartItem.quantity },
        }).exec();
    }
    const shippingFee = 0;
    const totalAmount = subtotal + shippingFee;
    const order = await order_repository_1.orderRepository.create({
        user: cart.user,
        items: orderItems,
        subtotal,
        shippingFee,
        totalAmount,
        status: order_model_1.OrderStatus.PENDING,
        paymentStatus: order_model_1.PaymentStatus.UNPAID,
        notes,
    });
    cart.items = [];
    await cart.save();
    return order;
};
exports.createOrderFromCart = createOrderFromCart;
const getMyOrders = async (userId) => {
    return order_repository_1.orderRepository.findByUserId(userId);
};
exports.getMyOrders = getMyOrders;
const getMyOrderById = async (userId, orderId) => {
    const order = await order_repository_1.orderRepository.findById(orderId);
    if (!order || order.user.toString() !== userId) {
        throw new api_error_1.ApiError(404, "Order not found");
    }
    return order;
};
exports.getMyOrderById = getMyOrderById;
const getAllOrders = async () => {
    return order_repository_1.orderRepository.findAll();
};
exports.getAllOrders = getAllOrders;
const getOrderByIdForAdmin = async (orderId) => {
    const order = await order_repository_1.orderRepository.findById(orderId);
    if (!order) {
        throw new api_error_1.ApiError(404, "Order not found");
    }
    return order;
};
exports.getOrderByIdForAdmin = getOrderByIdForAdmin;
const updateOrderStatus = async (orderId, status) => {
    const updated = await order_repository_1.orderRepository.updateStatus(orderId, status);
    if (!updated) {
        throw new api_error_1.ApiError(404, "Order not found");
    }
    return updated;
};
exports.updateOrderStatus = updateOrderStatus;
