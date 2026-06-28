import asyncHandler from "express-async-handler";
import { productService } from "../services/product.service.js";
import { ok, created, noContent, badRequestException, unprocessableException } from "../utils/httpResponse.js";
import { createProductSchema, updateProductSchema } from "../validations/product.validation.js";

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAll(req.query);
  return ok(res, result);
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const threshold = req.query.threshold ? parseInt(req.query.threshold) : 5;
  const products = await productService.getLowStock(threshold);
  return ok(res, { products });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getFeatured();
  return ok(res, { products });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const result = await productService.search(req.query);
  return ok(res, result);
});

export const getProductById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const isAdmin = ["owner", "admin_demo"].includes(req.session?.rol);
  const product = await productService.getById(id, isAdmin);
  return ok(res, { product });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllForAdmin(req.query);
  return ok(res, result);
});

export const createProduct = asyncHandler(async (req, res) => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    return unprocessableException(res, result.error.errors[0].message);
  }
  const product = await productService.create(result.data);
  return created(res, { product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    return unprocessableException(res, result.error.errors[0].message);
  }
  const product = await productService.update(id, result.data);
  return ok(res, { product });
});

export const toggleProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const product = await productService.toggleActive(id);
  return ok(res, { product });
});

export const setFeaturedProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { isFeatured } = req.body;
  const product = await productService.setFeatured(id, isFeatured);
  return ok(res, { product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await productService.delete(id);
  return noContent(res);
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) return badRequestException(res, "No se enviaron imágenes");
  const id = parseInt(req.params.id);
  const product = await productService.uploadImages(id, req.files);
  return ok(res, { product });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id);
  const imageId = parseInt(req.params.imageId);
  await productService.deleteImage(productId, imageId);
  return noContent(res);
});
