import ProductModel, { ProductDocument } from "../Product/product.model";

export interface ListProductsRepositoryInput {
  filter: Record<string, unknown>;
  sort: Record<string, 1 | -1>;
  page: number;
  limit: number;
}

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
    return ProductModel.findByIdAndUpdate(productId, update, { returnDocument: 'after' }).exec();
  },
  deleteById(productId: string) {
    return ProductModel.findByIdAndDelete(productId).exec();
  },
  async findAllPaginated(input: ListProductsRepositoryInput) {
    const skip = (input.page - 1) * input.limit;

    const [products, total] = await Promise.all([
      ProductModel.find(input.filter)
        .sort(input.sort)
        .skip(skip)
        .limit(input.limit)
        .exec(),
      ProductModel.countDocuments(input.filter).exec(),
    ]);

    return { products, total };
  },
};
