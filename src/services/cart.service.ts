import ProductModel from "../models/product.model";
import { cartRepository } from "../repositories/cart.repository";
import { ApiError } from "../utils/api-error";

const getOrCreateCart = async (userId: string) => {
  const existing = await cartRepository.findByUserId(userId);
  if (existing) {
    return existing;
  }
  return cartRepository.createForUser(userId);
};

export const getMyCart = async (userId: string) => {
  const cart = await cartRepository.findByUserIdWithProducts(userId);
  if (!cart) {
    return { items: [] };
  }
  return cart;
};

export const addItemToCart = async (userId: string, productId: string, quantity: number) => {
  const product = await ProductModel.findById(productId).exec();
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }
  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((item) => item.productId.toString() === productId);

  if (existing) {
    const nextQuantity = existing.quantity + quantity;
    if (nextQuantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }
    existing.quantity = nextQuantity;
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
    });
  }

  await cart.save();
  return cartRepository.findByUserIdWithProducts(userId);
};

export const updateCartItem = async (userId: string, productId: string, quantity: number) => {
  const product = await ProductModel.findById(productId).exec();
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }
  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((row) => row.productId.toString() === productId);
  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  item.quantity = quantity;
  await cart.save();
  return cartRepository.findByUserIdWithProducts(userId);
};

export const removeCartItem = async (userId: string, productId: string) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  await cart.save();
  return cartRepository.findByUserIdWithProducts(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await cartRepository.clear(userId);
  if (!cart) {
    return { items: [] };
  }
  return cart;
};
