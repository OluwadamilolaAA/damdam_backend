import { Request, Response } from "express";
import {
  parseCreateProductDto,
  parseListProductsQueryDto,
  parseUpdateProductDto,
} from "./product.dto";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listAllProductsForAdmin,
  listProducts,
  updateProduct,
} from "./product.service";
import { asyncHandler } from "../../utils/async-handler";
import { requireObjectId } from "../../utils/validators";

export const createProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseCreateProductDto(req.body);
  const product = await createProduct(payload);
  res.status(201).json({ product });
});

export const listProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = parseListProductsQueryDto(req.query);
  const result = await listProducts(query);
  res.status(200).json(result);
});

export const listAllProductsAdminHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const products = await listAllProductsForAdmin();
    res.status(200).json({ products });
  }
);

export const getProductByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = requireObjectId(req.params.id, "id");
  const product = await getProductById(productId);
  res.status(200).json({ product });
});

export const updateProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = requireObjectId(req.params.id, "id");
  const payload = parseUpdateProductDto(req.body);
  const product = await updateProduct(productId, payload);
  res.status(200).json({ product });
});

export const deleteProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const productId = requireObjectId(req.params.id, "id");
  await deleteProduct(productId);
  res.status(200).json({ message: "Product deleted" });
});
