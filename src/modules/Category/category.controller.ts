import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { createCategory, listCategories } from "./category.service";

export const createCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const category = await createCategory(name);
  res.status(201).json({ category });
});

export const listCategoriesHandler = asyncHandler(async (_req, res) => {
  const categories = await listCategories();
  res.status(200).json({ categories });
});