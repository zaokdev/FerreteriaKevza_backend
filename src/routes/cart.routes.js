import { Router } from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", getCart);
cartRouter.post("/items", addItem);
cartRouter.put("/items/:productId", updateItem);
cartRouter.delete("/items/:productId", removeItem);
cartRouter.delete("/", clearCart);

export { cartRouter };
