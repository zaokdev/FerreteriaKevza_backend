import { Router } from "express";
import {
  createCheckout,
  checkoutSuccess,
  checkoutCancel,
} from "../controllers/checkout.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const checkoutRouter = Router();

checkoutRouter.post("/", requireAuth, createCheckout);
checkoutRouter.get("/success", requireAuth, checkoutSuccess);
checkoutRouter.get("/cancel", requireAuth, checkoutCancel);

export { checkoutRouter };
