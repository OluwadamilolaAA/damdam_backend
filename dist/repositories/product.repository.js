"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
exports.productRepository = {
    create(data) {
        return product_model_1.default.create(data);
    },
    findAll(query = {}) {
        return product_model_1.default.find(query).sort({ createdAt: -1 }).exec();
    },
    findById(productId) {
        return product_model_1.default.findById(productId).exec();
    },
    updateById(productId, update) {
        return product_model_1.default.findByIdAndUpdate(productId, update, { new: true }).exec();
    },
    deleteById(productId) {
        return product_model_1.default.findByIdAndDelete(productId).exec();
    },
};
