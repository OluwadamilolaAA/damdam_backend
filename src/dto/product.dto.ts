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
