import ProductModel, { ProductDocument } from "../models/product.model";

export const productRepository = {
  create(data: Partial<ProductDocument>) {
    return ProductModel.create(data);
  },
  findAll(query: Record<string, unknown> = {}) {
    return ProductModel.find(query).sort({ createdAt: -1 }).exec();
  },
  findById(productId: string) {
    return ProductModel.findById(productId).exec();
  },
  updateById(productId: string, update: Partial<ProductDocument>) {
    return ProductModel.findByIdAndUpdate(productId, update, { new: true }).exec();
  },
  deleteById(productId: string) {
    return ProductModel.findByIdAndDelete(productId).exec();
  },
};
