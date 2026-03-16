"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRepository = void 0;
const cart_model_1 = __importDefault(require("./cart.model"));
exports.cartRepository = {
    findByUserId(userId) {
        return cart_model_1.default.findOne({ user: userId }).exec();
    },
    findByUserIdWithProducts(userId) {
        return cart_model_1.default.findOne({ user: userId })
            .populate("items.productId", "name price stock isActive")
            .exec();
    },
    createForUser(userId) {
        return cart_model_1.default.create({ user: userId, items: [] });
    },
    clear(userId) {
        return cart_model_1.default.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { returnDocument: "after" }).exec();
    },
};
