import { Request, Response } from "express";
import { parseAddCartItemDto, parseUpdateCartItemDto } from "./cart.dto";
import {
  addItemToCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { requireObjectId } from "../utils/validators";

const getRequestUserId = (req: Request): string => {
  const userId = req.authUser?.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  return userId;
};

export const getMyCartHandler = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getMyCart(getRequestUserId(req));
  res.status(200).json({ cart });
});

export const addCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseAddCartItemDto(req.body);
  const cart = await addItemToCart(getRequestUserId(req), payload.productId, payload.quantity);
  res.status(200).json({ cart });
});

export const updateCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseUpdateCartItemDto(req.body);
  const productId = requireObjectId(req.params.productId, "productId");
  const cart = await updateCartItem(getRequestUserId(req), productId, payload.quantity);
  res.status(200).json({ cart });
});

export const removeCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = requireObjectId(req.params.productId, "productId");
  const cart = await removeCartItem(getRequestUserId(req), productId);
  res.status(200).json({ cart });
});

export const clearCartHandler = asyncHandler(async (req: Request, res: Response) => {
  const cart = await clearCart(getRequestUserId(req));
  res.status(200).json({ cart });
});
