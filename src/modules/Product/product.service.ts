import {
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from "./product.dto";
import { ProductDocument } from "./product.model";
import { productRepository } from "./product.repository";
import { ApiError } from "../../utils/api-error";

export const createProduct = async (input: CreateProductDto) => {
  return productRepository.create(input);
};

interface ListProductsResponseMeta {
  total: number;
  pages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ListProductsResponse {
  products: ProductDocument[];
  meta: ListProductsResponseMeta;
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProductFilter = (
  input: ListProductsQueryDto,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {
    isActive: true,
  };

  if (input.categories && input.categories.length > 0) {
    filter.category = {
      $in: input.categories.map(
        (category) => new RegExp(`^${escapeRegex(category)}$`, "i"),
      ),
    };
  }

  if (input.minPrice !== undefined || input.maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (input.minPrice !== undefined) {
      priceFilter.$gte = input.minPrice;
    }
    if (input.maxPrice !== undefined) {
      priceFilter.$lte = input.maxPrice;
    }
    filter.price = priceFilter;
  }

  if (input.search) {
    // Using fast $text index search instead of
    // full collection scans typical with unanchored regexes
    filter.$text = { $search: input.search };
  }

  return filter;
};

const ALLOWED_SORT_FIELDS = new Set([
  "price",
  "createdAt",
  "updatedAt",
  "name",
  "stock",
]);

const buildSort = (sortValue?: string): Record<string, 1 | -1> => {
  if (!sortValue) {
    return { createdAt: -1 };
  }

  const sort: Record<string, 1 | -1> = {};
  const sortTokens = sortValue
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  for (const token of sortTokens) {
    const direction: 1 | -1 = token.startsWith("-") ? -1 : 1;
    const field = token.startsWith("-") ? token.slice(1) : token;

    if (!ALLOWED_SORT_FIELDS.has(field)) {
      throw new ApiError(
        400,
        `Unsupported sort field: ${field}. Allowed fields: ${Array.from(ALLOWED_SORT_FIELDS).join(", ")}`,
      );
    }

    sort[field] = direction;
  }

  if (Object.keys(sort).length === 0) {
    return { createdAt: -1 };
  }

  return sort;
};

export const listProducts = async (
  query: ListProductsQueryDto,
): Promise<ListProductsResponse> => {
  const filter = buildProductFilter(query);
  const sort = buildSort(query.sort);
  const { products, total } = await productRepository.findAllPaginated({
    filter,
    sort,
    page: query.page,
    limit: query.limit,
  });

  const pages = total === 0 ? 0 : Math.ceil(total / query.limit);
  const meta: ListProductsResponseMeta = {
    total,
    pages,
    page: query.page,
    limit: query.limit,
    hasNextPage: query.page < pages,
    hasPreviousPage: query.page > 1,
  };

  return { products, meta };
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

export const updateProduct = async (
  productId: string,
  input: UpdateProductDto,
) => {
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
