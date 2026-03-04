import OrderModel, { OrderDocument } from "../models/order.model";

export const orderRepository = {
  create(data: Partial<OrderDocument>) {
    return OrderModel.create(data);
  },
  findById(orderId: string) {
    return OrderModel.findById(orderId).exec();
  },
  findByUserId(userId: string) {
    return OrderModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  },
  findAll() {
    return OrderModel.find({}).sort({ createdAt: -1 }).exec();
  },
  updateStatus(orderId: string, status: string) {
    return OrderModel.findByIdAndUpdate(orderId, { $set: { status } }, { new: true }).exec();
  },
};
