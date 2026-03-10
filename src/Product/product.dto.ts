import { ApiError } from "../utils/api-error";
import { requireString } from "../utils/validators";

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  isActive?: boolean;
}

export interface ListProductsQueryDto {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page: number;
  limit: number;
  sort?: string;
}

const parseOptionalString = (value: unknown, field: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return requireString(value, field);
};

const parseNonNegativeNumber = (value: unknown, field: string): number => {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new ApiError(400, `${field} must be a non-negative number`);
  }
  return value;
};

const getQueryStringValue = (value: unknown, field: string): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const firstValue = value[0];
    if (typeof firstValue !== "string") {
      throw new ApiError(400, `${field} must be a string`);
    }
    return firstValue;
  }

  if (typeof value !== "string") {
    throw new ApiError(400, `${field} must be a string`);
  }

  return value;
};

const parseOptionalNonNegativeNumberFromQuery = (
  value: unknown,
  field: string
): number | undefined => {
  const raw = getQueryStringValue(value, field);
  if (raw === undefined || raw.trim() === "") {
    return undefined;
  }

  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new ApiError(400, `${field} must be a non-negative number`);
  }

  return parsed;
};

const parsePositiveIntegerFromQuery = (
  value: unknown,
  field: string,
  defaultValue: number,
  maxValue?: number
): number => {
  const raw = getQueryStringValue(value, field);
  if (raw === undefined || raw.trim() === "") {
    return defaultValue;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, `${field} must be a positive integer`);
  }

  if (maxValue !== undefined) {
    return Math.min(parsed, maxValue);
  }

  return parsed;
};

export const parseCreateProductDto = (body: unknown): CreateProductDto => {
  const data = body as Record<string, unknown>;

  return {
    name: requireString(data.name, "name"),
    description: parseOptionalString(data.description, "description"),
    price: parseNonNegativeNumber(data.price, "price"),
    stock: parseNonNegativeNumber(data.stock, "stock"),
    category: parseOptionalString(data.category, "category"),
  };
};

export const parseUpdateProductDto = (body: unknown): UpdateProductDto => {
  const data = body as Record<string, unknown>;
  const payload: UpdateProductDto = {};

  if (data.name !== undefined) {
    payload.name = requireString(data.name, "name");
  }
  if (data.description !== undefined) {
    payload.description = parseOptionalString(data.description, "description");
  }
  if (data.price !== undefined) {
    payload.price = parseNonNegativeNumber(data.price, "price");
  }
  if (data.stock !== undefined) {
    payload.stock = parseNonNegativeNumber(data.stock, "stock");
  }
  if (data.category !== undefined) {
    payload.category = parseOptionalString(data.category, "category");
  }
  if (data.isActive !== undefined) {
    if (typeof data.isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }
    payload.isActive = data.isActive;
  }

  if (Object.keys(payload).length === 0) {
    throw new ApiError(400, "At least one field is required for update");
  }

  return payload;
};

export const parseListProductsQueryDto = (query: unknown): ListProductsQueryDto => {
  const data = query as Record<string, unknown>;
  const categoryQuery = getQueryStringValue(data.category, "category");
  const search = getQueryStringValue(data.search, "search")?.trim();
  const sort = getQueryStringValue(data.sort, "sort");
  const minPrice = parseOptionalNonNegativeNumberFromQuery(data.minPrice, "minPrice");
  const maxPrice = parseOptionalNonNegativeNumberFromQuery(data.maxPrice, "maxPrice");

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    throw new ApiError(400, "minPrice cannot be greater than maxPrice");
  }

  const categories = categoryQuery
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    categories: categories && categories.length > 0 ? categories : undefined,
    minPrice,
    maxPrice,
    search: search || undefined,
    page: parsePositiveIntegerFromQuery(data.page, "page", 1),
    limit: parsePositiveIntegerFromQuery(data.limit, "limit", 10, 100),
    sort: sort?.trim() || undefined,
  };
};
