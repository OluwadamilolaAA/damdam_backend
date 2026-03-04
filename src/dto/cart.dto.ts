import { requireObjectId, requirePositiveInt } from "../utils/validators";

export interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export const parseAddCartItemDto = (body: unknown): AddCartItemDto => {
  const data = body as Record<string, unknown>;
  return {
    productId: requireObjectId(data.productId, "productId"),
    quantity: requirePositiveInt(data.quantity, "quantity"),
  };
};

export const parseUpdateCartItemDto = (body: unknown): UpdateCartItemDto => {
  const data = body as Record<string, unknown>;
  return {
    quantity: requirePositiveInt(data.quantity, "quantity"),
  };
};
