"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getOrderByIdForAdmin = exports.getAllOrders = exports.getMyOrderById = exports.getMyOrders = exports.createOrderFromCart = void 0;
const order_model_1 = __importStar(require("./order.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const product_model_1 = __importDefault(require("../Product/product.model"));
const order_repository_1 = require("./order.repository");
const api_error_1 = require("../utils/api-error");
const cart_model_1 = require("../Cart/cart.model");
const createOrderFromCart = async (userId, notes) => {
    //  Start a MongoDB session to ensure atomic transactions
    // This prevents scenarios where stock is deducted but order creation fails
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const cart = await cart_model_1.CartModel.findOne({ user: userId }).session(session);
        if (!cart || cart.items.length === 0) {
            throw new api_error_1.ApiError(400, "Cart is empty");
        }
        const orderItems = [];
        let subtotal = 0;
        for (const cartItem of cart.items) {
            const product = await product_model_1.default.findById(cartItem.productId).session(session);
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
                $inc: { stock: -cartItem.quantity }
            }, { session });
        }
        const shippingFee = 0;
        const totalAmount = subtotal + shippingFee;
        const [order] = await order_model_1.default.create([
            {
                user: cart.user,
                items: orderItems,
                subtotal,
                shippingFee,
                totalAmount,
                status: order_model_1.OrderStatus.PENDING,
                paymentStatus: order_model_1.PaymentStatus.UNPAID,
                notes,
            },
        ], { session });
        cart.items = [];
        await cart.save({ session });
        await session.commitTransaction();
        return order;
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
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
