import { OrderStatus } from "../Order/order.model";
import { ApiError } from "../utils/api-error";
import { requireEnum, requireString } from "../utils/validators";

export interface CreateOrderDto {
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export const parseCreateOrderDto = (body: unknown): CreateOrderDto => {
  const data = (body ?? {}) as Record<string, unknown>;
  if (data.notes === undefined || data.notes === null) {
    return {};
  }
  return { notes: requireString(data.notes, "notes") };
};

export const parseUpdateOrderStatusDto = (body: unknown): UpdateOrderStatusDto => {
  const data = body as Record<string, unknown>;
  if (data.status === undefined || data.status === null) {
    throw new ApiError(400, "status is required");
  }
  return {
    status: requireEnum(data.status, Object.values(OrderStatus), "status"),
  };
};
