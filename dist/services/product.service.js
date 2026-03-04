"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.listAllProductsForAdmin = exports.listProducts = exports.createProduct = void 0;
const product_repository_1 = require("../repositories/product.repository");
const api_error_1 = require("../utils/api-error");
const createProduct = async (input) => {
    return product_repository_1.productRepository.create(input);
};
exports.createProduct = createProduct;
const listProducts = async () => {
    return product_repository_1.productRepository.findAll({ isActive: true });
};
exports.listProducts = listProducts;
const listAllProductsForAdmin = async () => {
    return product_repository_1.productRepository.findAll({});
};
exports.listAllProductsForAdmin = listAllProductsForAdmin;
const getProductById = async (productId) => {
    const product = await product_repository_1.productRepository.findById(productId);
    if (!product || !product.isActive) {
        throw new api_error_1.ApiError(404, "Product not found");
    }
    return product;
};
exports.getProductById = getProductById;
const updateProduct = async (productId, input) => {
    const updated = await product_repository_1.productRepository.updateById(productId, input);
    if (!updated) {
        throw new api_error_1.ApiError(404, "Product not found");
    }
    return updated;
};
exports.updateProduct = updateProduct;
const deleteProduct = async (productId) => {
    const deleted = await product_repository_1.productRepository.deleteById(productId);
    if (!deleted) {
        throw new api_error_1.ApiError(404, "Product not found");
    }
};
exports.deleteProduct = deleteProduct;
