import { Router } from "express";
import {
  getOrders,
  getMyOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";

const orderRouter = Router();

orderRouter.use(requireAuth);

// Ruta /my ANTES de /:id para evitar conflicto con el parámetro
orderRouter.get("/my", getMyOrders);

orderRouter.get("/", requireRole("owner", "admin_demo"), getOrders);
orderRouter.get("/user/:userId", requireRole("owner", "admin_demo"), getOrdersByUser);
orderRouter.get("/:id", requireRole("owner", "admin_demo"), getOrderById);
orderRouter.put("/:id/status", requireRole("owner"), updateOrderStatus);

export { orderRouter };
