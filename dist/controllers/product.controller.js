"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductHandler = exports.updateProductHandler = exports.getProductByIdHandler = exports.listAllProductsAdminHandler = exports.listProductsHandler = exports.createProductHandler = void 0;
const product_dto_1 = require("../dto/product.dto");
const product_service_1 = require("../services/product.service");
const async_handler_1 = require("../utils/async-handler");
const validators_1 = require("../utils/validators");
exports.createProductHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const payload = (0, product_dto_1.parseCreateProductDto)(req.body);
    const product = await (0, product_service_1.createProduct)(payload);
    res.status(201).json({ product });
});
exports.listProductsHandler = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const products = await (0, product_service_1.listProducts)();
    res.status(200).json({ products });
});
exports.listAllProductsAdminHandler = (0, async_handler_1.asyncHandler)(async (_req, res) => {
    const products = await (0, product_service_1.listAllProductsForAdmin)();
    res.status(200).json({ products });
});
exports.getProductByIdHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const productId = (0, validators_1.requireObjectId)(req.params.id, "id");
    const product = await (0, product_service_1.getProductById)(productId);
    res.status(200).json({ product });
});
exports.updateProductHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const productId = (0, validators_1.requireObjectId)(req.params.id, "id");
    const payload = (0, product_dto_1.parseUpdateProductDto)(req.body);
    const product = await (0, product_service_1.updateProduct)(productId, payload);
    res.status(200).json({ product });
});
exports.deleteProductHandler = (0, async_handler_1.asyncHandler)(async (req, res) => {
    const productId = (0, validators_1.requireObjectId)(req.params.id, "id");
    await (0, product_service_1.deleteProduct)(productId);
    res.status(200).json({ message: "Product deleted" });
});
