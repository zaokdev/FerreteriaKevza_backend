import { stripe } from "../config/stripe.js";
import { cartService } from "./cart.service.js";
import { productRepository } from "../repositories/product.repository.js";
import { orderRepository } from "../repositories/order.repository.js";

export const checkoutService = {
  async createCheckoutSession(userId, customerEmail) {
    const { items } = await cartService.getCart(userId);

    if (!items.length) {
      const error = new Error("El carrito está vacío");
      error.status = 400;
      throw error;
    }

    // Validar stock actualizado de cada item
    for (const item of items) {
      const product = await productRepository.findByIdForStock(item.productId);
      if (!product || !product.isActive) {
        const error = new Error(
          `El producto "${item.name}" ya no está disponible`,
        );
        error.status = 409;
        throw error;
      }
      if (item.quantity > product.stock) {
        const error = new Error(
          `Stock insuficiente para "${item.name}". Disponible: ${product.stock}`,
        );
        error.status = 409;
        throw error;
      }
    }

    // Calcular total en MXN
    const total = items.reduce(
      (sum, item) => sum + parseFloat(item.precio) * item.quantity,
      0,
    );

    // Crear orden en DB
    const order = await orderRepository.create({
      idUser: userId,
      total,
      items: items.map((item) => ({
        idProduct: item.productId,
        quantity: item.quantity,
        unitPrice: item.precio,
      })),
    });

    // Crear sesión de Stripe — precios en MXN
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(parseFloat(item.precio) * 100),
          product_data: { name: item.name },
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: { allowed_countries: ["MX"] },
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: { orderId: String(order.id), userId: String(userId) },
      customer_email: customerEmail,
    });

    // Guardar stripeSessionId en la orden
    await orderRepository.updateStripeSession(order.id, session.id);

    return { url: session.url };
  },
};
