import { Request, Response } from "express";
import { parseCreateOrderDto, parseUpdateOrderStatusDto } from "../dto/order.dto";
import { Role } from "../models/user.model";
import {
  createOrderFromCart,
  getAllOrders,
  getOrderByIdForAdmin,
  getMyOrderById,
  getMyOrders,
  updateOrderStatus,
} from "../services/order.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { requireObjectId } from "../utils/validators";

const getRequestUser = (req: Request) => {
  if (!req.authUser) {
    throw new ApiError(401, "Unauthorized");
  }
  return req.authUser;
};

export const createOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const payload = parseCreateOrderDto(req.body);
  const order = await createOrderFromCart(user.userId, payload.notes);
  res.status(201).json({ order });
});

export const myOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const orders = await getMyOrders(user.userId);
  res.status(200).json({ orders });
});

export const getOrderByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const orderId = requireObjectId(req.params.id, "id");

  if (user.role === Role.ADMIN) {
    const order = await getOrderByIdForAdmin(orderId);
    res.status(200).json({ order });
    return;
  }

  const order = await getMyOrderById(user.userId, orderId);
  res.status(200).json({ order });
});

export const adminListOrdersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await getAllOrders();
  res.status(200).json({ orders });
});

export const adminUpdateOrderStatusHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const orderId = requireObjectId(req.params.id, "id");
    const payload = parseUpdateOrderStatusDto(req.body);
    const order = await updateOrderStatus(orderId, payload.status);
    res.status(200).json({ order });
  }
);
