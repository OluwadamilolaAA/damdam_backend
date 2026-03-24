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

  // 🔥 get or create cart
  let cart = await CartModel.findOne({ user: userId }).exec();

  if (!cart) {
    // validate stock for new cart
    if (quantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    cart = await CartModel.create({
      user: userId,
      items: [{ productId, quantity }],
    });

    return cartRepository.findByUserIdWithProducts(userId);
  }

  //  check if item already exists
  const existingItem = cart.items.find(
    (i: any) => i.productId.toString() === productId,
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;


    if (newQuantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    await CartModel.updateOne(
      { user: userId, "items.productId": productId },
      { $set: { "items.$.quantity": newQuantity } },
    );
  } else {
    // validate for new item
    if (quantity > product.stock) {
      throw new ApiError(400, "Requested quantity exceeds available stock");
    }

    await CartModel.updateOne(
      { user: userId },
      { $push: { items: { productId, quantity } } },
    );
  }

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
