import { Types } from "mongoose";
import { z } from "zod";
import { parseWithSchema } from "../../utils/zod";

const addCartItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), "productId must be a valid id"),
  quantity: z
    .number()
    .refine(
      (value) => Number.isInteger(value) && value > 0,
      "quantity must be a positive integer"
    ),
});

const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .refine(
      (value) => Number.isInteger(value) && value > 0,
      "quantity must be a positive integer"
    ),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

export const parseAddCartItemDto = (body: unknown): AddCartItemDto => {
  return parseWithSchema(addCartItemSchema, body);
};

export const parseUpdateCartItemDto = (body: unknown): UpdateCartItemDto => {
  return parseWithSchema(updateCartItemSchema, body);
};
