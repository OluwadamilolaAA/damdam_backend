import OrderModel, { OrderStatus, PaymentStatus } from "./order.model";
import mongoose from "mongoose";
import ProductModel from "../Product/product.model";
import { orderRepository } from "./order.repository";
import { cartRepository } from "../Cart/cart.repository";
import { ApiError } from "../../utils/api-error";
import { CartModel } from "../Cart/cart.model";

export const createOrderFromCart = async (userId: string, notes?: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // fetch cart with session
    const cart = await cartRepository.findByUserIdWithSession(userId, session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    if (cart.isCheckingOut) {
      throw new ApiError(400, "Checkout already in progress");
    }

    // prevent double checkout
    cart.isCheckingOut = true;
    await cart.save({ session });

    const orderItems: any[] = [];
    let subtotal = 0;

    // loop through cart items
    for (const cartItem of cart.items) {
      const product = await ProductModel.findById(cartItem.productId).exec();

      if (!product || !product.isActive) {
        throw new ApiError(
          400,
          `Product ${cartItem.productId} is unavailable`
        );
      }

      if (cartItem.quantity > product.stock) {
        throw new ApiError(
          400,
          `Insufficient stock for product ${product.name}`
        );
      }

      const lineTotal = product.price * cartItem.quantity;
      subtotal += lineTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        unitPriceAtPurchase: product.price, 
        quantity: cartItem.quantity,
        lineTotal,
      });
    }

    const shippingFee = subtotal > 50000 ? 0 : 2000;
    const totalAmount = subtotal + shippingFee;

    const order = await OrderModel.create(
      [
        {
          user: cart.user,
          items: orderItems,
          subtotal,
          shippingFee,
          totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          notes,
        },
      ],
      { session }
    );

    // clear cart after order creation
    cart.items = [];
    cart.isCheckingOut = false;
    await cart.save({ session });

    await session.commitTransaction();

    return { order: order[0], paymentUrl: null };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Get all orders for a user
export const getMyOrders = async (userId: string) => {
  return orderRepository.findByUserId(userId);
};

// Get a single order by ID for a user
export const getMyOrderById = async (userId: string, orderId: string) => {
  const order = await orderRepository.findById(orderId);
  if (!order || order.user.toString() !== userId) {
    throw new ApiError(404, "Order not found");
  }
  return order;
};

// Admin: get all orders
export const getAllOrders = async () => {
  return orderRepository.findAll();
};

// Admin: get single order by ID
export const getOrderByIdForAdmin = async (orderId: string) => {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return order;
};

// Update order status (admin)
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  const updated = await orderRepository.updateStatus(orderId, status);
  if (!updated) {
    throw new ApiError(404, "Order not found");
  }
  return updated;
};


export const handlePaymentSuccess = async (orderId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await OrderModel.findById(orderId).session(session);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.paymentStatus === PaymentStatus.PAID) {
      return order; 
    }

    for (const item of order.items) {
      const updated = await ProductModel.findOneAndUpdate(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (!updated) {
        throw new ApiError(
          400,
          `Stock no longer available for product ${item.name}`
        );
      }
    }

    order.paymentStatus = PaymentStatus.PAID;
    order.status = OrderStatus.CONFIRMED;
    await order.save({ session });

    await session.commitTransaction();
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};