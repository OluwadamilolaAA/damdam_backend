"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.listAllProductsForAdmin = exports.listProducts = exports.createProduct = void 0;
const product_repository_1 = require("./product.repository");
const api_error_1 = require("../utils/api-error");
const createProduct = async (input) => {
    return product_repository_1.productRepository.create(input);
};
exports.createProduct = createProduct;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const buildProductFilter = (input) => {
    const filter = {
        isActive: true,
    };
    if (input.categories && input.categories.length > 0) {
        filter.category = {
            $in: input.categories.map((category) => new RegExp(`^${escapeRegex(category)}$`, "i")),
        };
    }
    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
        const priceFilter = {};
        if (input.minPrice !== undefined) {
            priceFilter.$gte = input.minPrice;
        }
        if (input.maxPrice !== undefined) {
            priceFilter.$lte = input.maxPrice;
        }
        filter.price = priceFilter;
    }
    if (input.search) {
        // Using fast $text index search instead of
        // full collection scans typical with unanchored regexes
        filter.$text = { $search: input.search };
    }
    return filter;
};
const ALLOWED_SORT_FIELDS = new Set([
    "price",
    "createdAt",
    "updatedAt",
    "name",
    "stock",
]);
const buildSort = (sortValue) => {
    if (!sortValue) {
        return { createdAt: -1 };
    }
    const sort = {};
    const sortTokens = sortValue
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean);
    for (const token of sortTokens) {
        const direction = token.startsWith("-") ? -1 : 1;
        const field = token.startsWith("-") ? token.slice(1) : token;
        if (!ALLOWED_SORT_FIELDS.has(field)) {
            throw new api_error_1.ApiError(400, `Unsupported sort field: ${field}. Allowed fields: ${Array.from(ALLOWED_SORT_FIELDS).join(", ")}`);
        }
        sort[field] = direction;
    }
    if (Object.keys(sort).length === 0) {
        return { createdAt: -1 };
    }
    return sort;
};
const listProducts = async (query) => {
    const filter = buildProductFilter(query);
    const sort = buildSort(query.sort);
    const { products, total } = await product_repository_1.productRepository.findAllPaginated({
        filter,
        sort,
        page: query.page,
        limit: query.limit,
    });
    const pages = total === 0 ? 0 : Math.ceil(total / query.limit);
    const meta = {
        total,
        pages,
        page: query.page,
        limit: query.limit,
        hasNextPage: query.page < pages,
        hasPreviousPage: query.page > 1,
    };
    return { products, meta };
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
