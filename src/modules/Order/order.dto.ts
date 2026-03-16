import { OrderStatus } from "./order.model";
import { z } from "zod";
import { parseWithSchema } from "../../utils/zod";

const createOrderSchema = z.object({
  notes: z.string().trim().min(1, "notes is required").optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    error: "status must be one of: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED",
  }),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;

export const parseCreateOrderDto = (body: unknown): CreateOrderDto => {
  return parseWithSchema(createOrderSchema, body ?? {});
};

export const parseUpdateOrderStatusDto = (body: unknown): UpdateOrderStatusDto => {
  return parseWithSchema(updateOrderStatusSchema, body);
};
