import asyncHandler from "express-async-handler";
import { cartService } from "../services/cart.service.js";
import { ok, noContent } from "../utils/httpResponse.js";

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.session.userId);
  return ok(res, { cart });
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  await cartService.addItem(req.session.userId, parseInt(productId), parseInt(quantity));
  const cart = await cartService.getCart(req.session.userId);
  return ok(res, { cart });
});

export const updateItem = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;
  await cartService.updateItem(req.session.userId, productId, parseInt(quantity));
  const cart = await cartService.getCart(req.session.userId);
  return ok(res, { cart });
});

export const removeItem = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.productId);
  await cartService.removeItem(req.session.userId, productId);
  const cart = await cartService.getCart(req.session.userId);
  return ok(res, { cart });
});

export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.session.userId);
  return noContent(res);
});
