import ProductModel from "../Product/product.model";
import { cartRepository } from "./cart.repository";
import { ApiError } from "../../utils/api-error";
import { CartModel } from "./cart.model";

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

export const addItemToCart = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  const product = await ProductModel.findById(productId).exec();
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }
  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  // Using MongoDB array update operators for atomicity instead of fetching, modifying in-memory, and saving
  const existingCart = await CartModel.findOne({ user: userId }).exec();

  if (!existingCart) {
    // No cart yet → create one
    await CartModel.create({
      user: userId,
      items: [{ productId, quantity }],
    });
  } else {
    // Cart exists → update it
    const item = existingCart.items.find(
      (i: any) => i.productId.toString() === productId,
    );

    if (item) {
      const newQuantity = item.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new ApiError(400, "Requested quantity exceeds available stock");
      }

      await CartModel.updateOne(
        { user: userId, "items.productId": productId },
        { $set: { "items.$.quantity": newQuantity } },
      );
    } else {
      await CartModel.updateOne(
        { user: userId },
        { $push: { items: { productId, quantity } } },
      );
    }
  }

  return cartRepository.findByUserIdWithProducts(userId);
};

export const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  // Check if product exists and is active
  const product = await ProductModel.findById(productId).exec();

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  // Check stock availability
  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  // Atomic update
  const updatedCart = await CartModel.findOneAndUpdate(
    { user: userId, "items.productId": productId },
    { $set: { "items.$.quantity": quantity } },
    {
      new: true,          // return updated document
      runValidators: true // enforce schema validation
    }
  );

  // If item not found in cart
  if (!updatedCart) {
    throw new ApiError(404, "Item not found in cart");
  }

  // Return cart with populated products
  return cartRepository.findByUserIdWithProducts(userId);
};

export const removeCartItem = async (userId: string, productId: string) => {
  // Use $pull operator for atomic removal without needing to fetch and parse the array
  await CartModel.updateOne(
    { user: userId },
    { $pull: { items: { productId } } },
  );
  return cartRepository.findByUserIdWithProducts(userId);
};

export const clearCart = async (userId: string) => {
  const cart = await cartRepository.clear(userId);
  if (!cart) {
    return { items: [] };
  }
  return cart;
};
