"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseListProductsQueryDto = exports.parseUpdateProductDto = exports.parseCreateProductDto = void 0;
const zod_1 = require("zod");
const zod_2 = require("../utils/zod");
const nonEmptyString = (field) => zod_1.z.string().trim().min(1, `${field} is required`);
const normalizeQueryValue = (value) => Array.isArray(value) ? value[0] : value;
const queryString = (field) => zod_1.z.preprocess(normalizeQueryValue, zod_1.z.string({ error: `${field} must be a string` }));
const optionalQueryString = (field) => zod_1.z.preprocess((value) => {
    const normalized = normalizeQueryValue(value);
    if (normalized === undefined || normalized === null) {
        return undefined;
    }
    return normalized;
}, zod_1.z.string({ error: `${field} must be a string` }).optional());
const nonNegativeNumber = (field) => zod_1.z
    .number({ error: `${field} must be a non-negative number` })
    .refine((value) => !Number.isNaN(value) && value >= 0, {
    error: `${field} must be a non-negative number`,
});
const optionalNonNegativeNumberFromQuery = (field) => zod_1.z.preprocess((value) => {
    const normalized = normalizeQueryValue(value);
    if (normalized === undefined || normalized === null || normalized === "") {
        return undefined;
    }
    if (typeof normalized === "number") {
        return normalized;
    }
    if (typeof normalized === "string") {
        return Number(normalized);
    }
    return normalized;
}, nonNegativeNumber(field).optional());
const positiveIntegerFromQuery = (field, defaultValue, maxValue) => zod_1.z
    .preprocess((value) => {
    const normalized = normalizeQueryValue(value);
    if (normalized === undefined || normalized === null || normalized === "") {
        return defaultValue;
    }
    if (typeof normalized === "number") {
        return normalized;
    }
    if (typeof normalized === "string") {
        return Number(normalized);
    }
    return normalized;
}, zod_1.z.number({ error: `${field} must be a positive integer` }))
    .refine((value) => Number.isInteger(value) && value >= 1, `${field} must be a positive integer`)
    .transform((value) => (maxValue !== undefined ? Math.min(value, maxValue) : value));
const createProductSchema = zod_1.z.object({
    name: nonEmptyString("name"),
    description: nonEmptyString("description").optional(),
    price: nonNegativeNumber("price"),
    stock: nonNegativeNumber("stock"),
    category: nonEmptyString("category").optional(),
});
const updateProductSchema = zod_1.z
    .object({
    name: nonEmptyString("name").optional(),
    description: nonEmptyString("description").optional(),
    price: nonNegativeNumber("price").optional(),
    stock: nonNegativeNumber("stock").optional(),
    category: nonEmptyString("category").optional(),
    isActive: zod_1.z.boolean({ error: "isActive must be a boolean" }).optional(),
})
    .refine((payload) => Object.keys(payload).length > 0, {
    error: "At least one field is required for update",
});
const listProductsQueryBaseSchema = zod_1.z.object({
    category: optionalQueryString("category"),
    minPrice: optionalNonNegativeNumberFromQuery("minPrice"),
    maxPrice: optionalNonNegativeNumberFromQuery("maxPrice"),
    search: optionalQueryString("search"),
    page: positiveIntegerFromQuery("page", 1),
    limit: positiveIntegerFromQuery("limit", 10, 100),
    sort: optionalQueryString("sort"),
});
const listProductsQuerySchema = listProductsQueryBaseSchema.superRefine((data, ctx) => {
    if (data.minPrice !== undefined &&
        data.maxPrice !== undefined &&
        data.minPrice > data.maxPrice) {
        ctx.addIssue({
            code: "custom",
            message: "minPrice cannot be greater than maxPrice",
            path: ["minPrice"],
        });
    }
});
const parseCreateProductDto = (body) => (0, zod_2.parseWithSchema)(createProductSchema, body);
exports.parseCreateProductDto = parseCreateProductDto;
const parseUpdateProductDto = (body) => (0, zod_2.parseWithSchema)(updateProductSchema, body);
exports.parseUpdateProductDto = parseUpdateProductDto;
const parseListProductsQueryDto = (query) => {
    const parsed = (0, zod_2.parseWithSchema)(listProductsQuerySchema, (query ?? {}));
    const categories = parsed.category
        ?.split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    return {
        categories: categories && categories.length > 0 ? categories : undefined,
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice,
        search: parsed.search?.trim() || undefined,
        page: parsed.page,
        limit: parsed.limit,
        sort: parsed.sort?.trim() || undefined,
    };
};
exports.parseListProductsQueryDto = parseListProductsQueryDto;
