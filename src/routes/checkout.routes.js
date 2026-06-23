import { Router } from "express";
import {
  createCheckout,
  checkoutSuccess,
  checkoutCancel,
} from "../controllers/checkout.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { rateLimit } from "../middlewares/rateLimit.js";
import { checkoutLimiter } from "../config/rateLimit.js";

const checkoutRouter = Router();

// Limitador después de requireAuth: ya hay sesión, así que agrupamos por userId.
checkoutRouter.post(
  "/",
  requireAuth,
  rateLimit(checkoutLimiter, (req) => req.session.userId),
  createCheckout,
);
checkoutRouter.get("/success", requireAuth, checkoutSuccess);
checkoutRouter.get("/cancel", requireAuth, checkoutCancel);

export { checkoutRouter };
