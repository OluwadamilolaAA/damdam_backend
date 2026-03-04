import CartModel from "../models/cart.model";

export const cartRepository = {
  findByUserId(userId: string) {
    return CartModel.findOne({ user: userId }).exec();
  },
  findByUserIdWithProducts(userId: string) {
    return CartModel.findOne({ user: userId })
      .populate("items.productId", "name price stock isActive")
      .exec();
  },
  createForUser(userId: string) {
    return CartModel.create({ user: userId, items: [] });
  },
  clear(userId: string) {
    return CartModel.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { new: true }).exec();
  },
};
