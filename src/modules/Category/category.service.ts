import { CategoryModel } from "./category.model";
import { ApiError } from "../../utils/api-error";

export const createCategory = async (name: string) => {
  const normalized = name.trim().toLowerCase();

  const existing = await CategoryModel.findOne({ name: normalized });
  if (existing) throw new ApiError(400, "Category already exists");

  return CategoryModel.create({ name: normalized });
};

export const listCategories = async () => {
  return CategoryModel.find().sort({ createdAt: -1 });
};