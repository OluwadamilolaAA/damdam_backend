import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { productRepository } from "../repositories/product.repository";
import { ApiError } from "../utils/api-error";

export const createProduct = async (input: CreateProductDto) => {
  return productRepository.create(input);
};

export const listProducts = async () => {
  return productRepository.findAll({ isActive: true });
};

export const listAllProductsForAdmin = async () => {
  return productRepository.findAll({});
};

export const getProductById = async (productId: string) => {
  const product = await productRepository.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const updateProduct = async (productId: string, input: UpdateProductDto) => {
  const updated = await productRepository.updateById(productId, input);
  if (!updated) {
    throw new ApiError(404, "Product not found");
  }
  return updated;
};

export const deleteProduct = async (productId: string) => {
  const deleted = await productRepository.deleteById(productId);
  if (!deleted) {
    throw new ApiError(404, "Product not found");
  }
};
