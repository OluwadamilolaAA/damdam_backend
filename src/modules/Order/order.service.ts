import OrderModel, { OrderStatus, PaymentStatus } from "./order.model";
import mongoose, { Types } from "mongoose";
import ProductModel from "../Product/product.model";
import { orderRepository } from "./order.repository";
import { cartRepository } from "../Cart/cart.repository";
import { ApiError } from "../../utils/api-error";
import { CartModel } from "../Cart/cart.model";

export const createOrderFromCart = async (userId: string, notes?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await cartRepository.findByUserIdWithSession(userId, session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    if (cart.isCheckingOut) {
      throw new ApiError(400, "Checkout already in progress");
    }

    cart.isCheckingOut = true;
    await cart.save({ session });

    const orderItems: any[] = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await ProductModel.findOneAndUpdate(
        {
          _id: cartItem.productId,
          isActive: true,
          stock: { $gte: cartItem.quantity },
        },
        {
          $inc: { stock: -cartItem.quantity },
        },
        { session, new: true }
      );

      if (!product) {
        throw new ApiError(
          400,
          "One or more products are unavailable or out of stock"
        );
      }

      const lineTotal = product.price * cartItem.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        unitPrice: product.price,
        quantity: cartItem.quantity,
        lineTotal,
      });
    }

    const shippingFee = subtotal > 50000 ? 0 : 2000;
    const totalAmount = subtotal + shippingFee;

    const [order] = await OrderModel.create(
      [
        {
          user: cart.user,
          items: orderItems,
          subtotal,
          shippingFee,
          totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          paymentId: undefined,
          notes,
        },
      ],
      { session }
    );

    // clear cart
    cart.items = [];
    cart.isCheckingOut = false;
    await cart.save({ session });

    await session.commitTransaction();

    return { order, paymentUrl: null }; //  now valid

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
) => {
  const updated = await orderRepository.updateStatus(orderId, status);
  if (!updated) {
    throw new ApiError(404, "Order not found");
  }
  return updated;
};
