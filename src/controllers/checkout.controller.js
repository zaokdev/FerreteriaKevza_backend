import asyncHandler from "express-async-handler";
import { checkoutService } from "../services/checkout.service.js";
import { stripeWebhookService } from "../services/stripe.webhook.service.js";
import { orderRepository } from "../repositories/order.repository.js";
import { stripe } from "../config/stripe.js";
import { ok } from "../utils/httpResponse.js";

export const createCheckout = asyncHandler(async (req, res) => {
  const result = await checkoutService.createCheckoutSession(
    req.session.userId,
    req.session.email,
  );
  return ok(res, result);
});

export const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  await stripeWebhookService.handleEvent(req.body, signature);
  res.sendStatus(200);
});

export const checkoutSuccess = asyncHandler(async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return ok(res, { order: null, shipping: null });
  }

  const [session, order] = await Promise.all([
    stripe.checkout.sessions.retrieve(session_id),
    orderRepository.findBySessionId(session_id),
  ]);

  const shipping = session.shipping_details
    ? { name: session.shipping_details.name, address: session.shipping_details.address }
    : null;

  return ok(res, { order, shipping });
});

export const checkoutCancel = asyncHandler(async (req, res) => {
  return ok(res, { message: "Pago cancelado" });
});
