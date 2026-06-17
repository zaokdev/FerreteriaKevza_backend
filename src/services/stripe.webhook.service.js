import { stripe } from "../config/stripe.js";
import { cache } from "../config/redis.js";
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { transporter } from "../config/mailer.js";
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

  // Preparar datos para los correos
  const emailItems = order.orderDetails.map((detail) => ({
    name: detail.product.name,
    quantity: detail.quantity,
    unitPrice: detail.unitPrice,
  }));

  // Enviar correo de confirmación al cliente
  const clientTemplate = orderConfirmationClient({ order, items: emailItems });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: order.user.email,
    ...clientTemplate,
  });

  // Enviar resumen al owner
  const ownerTemplate = orderConfirmationOwner({ order, items: emailItems });
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    ...ownerTemplate,
  });

  // Marcar correos como enviados
  await orderRepository.markEmailSent(orderId);
}

async function handleCheckoutExpired(session) {
  const orderId = parseInt(session.metadata?.orderId);
  if (!orderId) return;

  await orderRepository.updateStatus(orderId, "cancelado");
}
