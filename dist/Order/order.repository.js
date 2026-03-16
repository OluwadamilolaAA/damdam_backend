"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = void 0;
const order_model_1 = __importDefault(require("./order.model"));
exports.orderRepository = {
    create(data) {
        return order_model_1.default.create(data);
    },
    findById(orderId) {
        return order_model_1.default.findById(orderId).exec();
    },
    findByUserId(userId) {
        return order_model_1.default.find({ user: userId }).sort({ createdAt: -1 }).exec();
    },
    findAll() {
        return order_model_1.default.find({}).sort({ createdAt: -1 }).exec();
    },
    updateStatus(orderId, status) {
        return order_model_1.default.findByIdAndUpdate(orderId, { $set: { status } }, { returnDocument: "after" }).exec();
    },
};
