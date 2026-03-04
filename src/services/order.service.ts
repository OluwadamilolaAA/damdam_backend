import { OrderStatus, PaymentStatus } from "../models/order.model";
import { Types } from "mongoose";
import ProductModel from "../models/product.model";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { ApiError } from "../utils/api-error";

export const createOrderFromCart = async (userId: string, notes?: string) => {
  const cart = await cartRepository.findByUserId(userId);
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const orderItems: Array<{
    productId: Types.ObjectId;
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }> = [];
  let subtotal = 0;

  for (const cartItem of cart.items) {
    const product = await ProductModel.findById(cartItem.productId).exec();
    if (!product || !product.isActive) {
      throw new ApiError(400, "One or more products in cart are unavailable");
    }
    if (cartItem.quantity > product.stock) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    const lineTotal = product.price * cartItem.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: product._id as Types.ObjectId,
      name: product.name,
      unitPrice: product.price,
      quantity: cartItem.quantity,
      lineTotal,
    });
  }

  for (const cartItem of cart.items) {
    await ProductModel.findByIdAndUpdate(cartItem.productId, {
      $inc: { stock: -cartItem.quantity },
    }).exec();
  }

  const shippingFee = 0;
  const totalAmount = subtotal + shippingFee;

  const order = await orderRepository.create({
    user: cart.user,
    items: orderItems,
    subtotal,
    shippingFee,
    totalAmount,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
    notes,
  });

  cart.items = [];
  await cart.save();

  return order;
};

export const getMyOrders = async (userId: string) => {
  return orderRepository.findByUserId(userId);
};

export const getMyOrderById = async (userId: string, orderId: string) => {
  const order = await orderRepository.findById(orderId);
  if (!order || order.user.toString() !== userId) {
    throw new ApiError(404, "Order not found");
  }
  return order;
};

export const getAllOrders = async () => {
  return orderRepository.findAll();
};

export const getOrderByIdForAdmin = async (orderId: string) => {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return order;
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const updated = await orderRepository.updateStatus(orderId, status);
  if (!updated) {
    throw new ApiError(404, "Order not found");
  }
  return updated;
};
