import asyncHandler from "express-async-handler";
import { orderService } from "../services/order.service.js";
import { ok } from "../utils/httpResponse.js";

export const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAll(req.query);
  return ok(res, result);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getByUser(req.session.userId, req.query);
  return ok(res, result);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await orderService.getById(id);
  return ok(res, { order });
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId);
  const result = await orderService.getByUserAdmin(userId, req.query);
  return ok(res, result);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = await orderService.updateStatus(id, status);
  return ok(res, { order });
});
