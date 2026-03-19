import CartModel from "./cart.model";
import mongoose from "mongoose"

export const cartRepository = {
  findByUserId(userId: string) {
    return CartModel.findOne({ user: userId }).exec();
  },
  findByUserIdWithProducts(userId: string) {
    return CartModel.findOne({ user: userId })
      .populate("items.productId", "name price stock isActive")
      .exec();
  },
  findByUserIdWithSession(userId: string, session: mongoose.ClientSession) {
  return CartModel.findOne({ user: userId }).session(session);
},
  createForUser(userId: string) {
    return CartModel.create({ user: userId, items: [] });
  },
  clear(userId: string) {
    return CartModel.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { returnDocument: "after" },
    ).exec();
  },
};
