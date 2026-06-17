import asyncHandler from "express-async-handler";
import { categoryService } from "../services/category.service.js";
import { ok, created, noContent } from "../utils/httpResponse.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAll();
  return ok(res, { categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  return created(res, { category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const category = await categoryService.update(id, req.body);
  return ok(res, { category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await categoryService.delete(id);
  return noContent(res);
});
