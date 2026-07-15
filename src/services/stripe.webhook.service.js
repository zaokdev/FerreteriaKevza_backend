import { stripe } from "../config/stripe.js";
import { cache } from "../config/redis.js";
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { sendMail } from "../config/mailer.js";
import { logger } from "../config/logger.js";
import {
  orderConfirmationClient,
  orderConfirmationOwner,
} from "../utils/email.templates.js";

export const stripeWebhookService = {
  async handleEvent(rawBody, signature) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      const error = new Error("Firma del webhook inválida");
      error.status = 400;
      throw error;
    }

    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object);
    }

    if (event.type === "checkout.session.expired") {
      await handleCheckoutExpired(event.data.object);
    }
  },
};

async function handleCheckoutCompleted(session) {
  const orderId = parseInt(session.metadata.orderId);
  const userId = parseInt(session.metadata.userId);

  const order = await orderRepository.findByIdForFulfillment(orderId);

  if (!order) return;

  // Stripe reintenta el evento ante cualquier respuesta que no sea 2xx (o si tarda más de 20 s).
  // Sin esta guarda, cada reintento volvería a descontar el stock de la misma orden.
  if (order.stripeStatus !== "paid") {
    // Actualizar estado de pago en la orden
    await orderRepository.updateStripePayment(orderId, {
      stripeStatus: session.payment_status,
      stripePaymentId: session.payment_intent,
    });

    // Descontar stock con transacción atómica
    await productRepository.decrementStock(
      order.orderDetails.map((detail) => ({
        idProduct: detail.idProduct,
        quantity: detail.quantity,
      })),
    );

    // Limpiar carrito del usuario
    await cache.del(`carrito:${userId}`);
  }

  // Sin await a propósito: Stripe corta la conexión a los 20 s y reintenta el evento.
  // El pago ya está registrado y el stock descontado, así que los correos —que son solo una
  // notificación— no deben retrasar la respuesta ni hacer fallar el webhook si Gmail falla.
  if (!order.emailSent) sendOrderEmails(order);
}

// Nunca lanza: un fallo de correo se registra y se ignora. emailSent queda en false, lo que
// permite reenviarlos después sin haber roto el procesamiento del pago.
async function sendOrderEmails(order) {
  const emailItems = order.orderDetails.map((detail) => ({
    name: detail.product.name,
    quantity: detail.quantity,
    unitPrice: detail.unitPrice,
  }));

  try {
    // Enviar correo de confirmación al cliente
    const clientTemplate = orderConfirmationClient({ order, items: emailItems });
    await sendMail({ to: order.user.email, ...clientTemplate });

    // Enviar resumen al owner
    const ownerTemplate = orderConfirmationOwner({ order, items: emailItems });
    await sendMail({ to: process.env.OWNER_EMAIL, ...ownerTemplate });

    // Marcar correos como enviados
    await orderRepository.markEmailSent(order.id);
  } catch (error) {
    logger.error(
      `Fallo al enviar los correos de la orden ${order.id} — ${error.message}`,
    );
  }
}

async function handleCheckoutExpired(session) {
  const orderId = parseInt(session.metadata?.orderId);
  if (!orderId) return;

  await orderRepository.updateStatus(orderId, "cancelado");
}
