import { z } from "zod";
import { parseWithSchema } from "../../utils/zod";

const nonEmptyString = (field: string) =>
  z.string().trim().min(1, `${field} is required`);

const normalizeQueryValue = (value: unknown): unknown =>
  Array.isArray(value) ? value[0] : value;

const queryString = (field: string) =>
  z.preprocess(
    normalizeQueryValue,
    z.string({ error: `${field} must be a string` })
  );

const optionalQueryString = (field: string) =>
  z.preprocess((value) => {
    const normalized = normalizeQueryValue(value);
    if (normalized === undefined || normalized === null) {
      return undefined;
    }
    return normalized;
  }, z.string({ error: `${field} must be a string` }).optional());

const nonNegativeNumber = (field: string) =>
  z
    .number({ error: `${field} must be a non-negative number` })
    .refine((value) => !Number.isNaN(value) && value >= 0, {
      error: `${field} must be a non-negative number`,
    });

const optionalNonNegativeNumberFromQuery = (field: string) =>
  z.preprocess((value) => {
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

const positiveIntegerFromQuery = (field: string, defaultValue: number, maxValue?: number) =>
  z
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
    }, z.number({ error: `${field} must be a positive integer` }))
    .refine(
      (value) => Number.isInteger(value) && value >= 1,
      `${field} must be a positive integer`
    )
    .transform((value) => (maxValue !== undefined ? Math.min(value, maxValue) : value));

const createProductSchema = z.object({
  name: nonEmptyString("name"),
  description: nonEmptyString("description").optional(),
  price: nonNegativeNumber("price"),
  stock: nonNegativeNumber("stock"),
  category: z.string().optional(),
});

const updateProductSchema = z
  .object({
    name: nonEmptyString("name").optional(),
    description: nonEmptyString("description").optional(),
    price: nonNegativeNumber("price").optional(),
    stock: nonNegativeNumber("stock").optional(),
    category: z.string().optional(),
    isActive: z.boolean({ error: "isActive must be a boolean" }).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    error: "At least one field is required for update",
  });

const listProductsQueryBaseSchema = z.object({
  categoryId: optionalQueryString("categoryId"),
  minPrice: optionalNonNegativeNumberFromQuery("minPrice"),
  maxPrice: optionalNonNegativeNumberFromQuery("maxPrice"),
  search: optionalQueryString("search"),
  page: positiveIntegerFromQuery("page", 1),
  limit: positiveIntegerFromQuery("limit", 10, 100),
  sort: optionalQueryString("sort"),
});

const listProductsQuerySchema = listProductsQueryBaseSchema.superRefine((data, ctx) => {
  if (
    data.minPrice !== undefined &&
    data.maxPrice !== undefined &&
    data.minPrice > data.maxPrice
  ) {
    ctx.addIssue({
      code: "custom",
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    });
  }
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export interface ListProductsQueryDto {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page: number;
  limit: number;
  sort?: string;
}

export const parseCreateProductDto = (body: unknown): CreateProductDto =>
  parseWithSchema(createProductSchema, body);

export const parseUpdateProductDto = (body: unknown): UpdateProductDto =>
  parseWithSchema(updateProductSchema, body);

export const parseListProductsQueryDto = (query: unknown): ListProductsQueryDto => {
  const parsed = parseWithSchema(
    listProductsQuerySchema,
    (query ?? {}) as Record<string, unknown>
  );

  return {
    categoryId: parsed.categoryId,
    minPrice: parsed.minPrice,
    maxPrice: parsed.maxPrice,
    search: parsed.search?.trim() || undefined,
    page: parsed.page,
    limit: parsed.limit,
    sort: parsed.sort?.trim() || undefined,
  };
};
