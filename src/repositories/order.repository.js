import { prisma } from "../config/prisma.js";

const orderWithRelations = {
  id: true,
  total: true,
  status: true,
  stripeSessionId: true,
  stripePaymentId: true,
  stripeStatus: true,
  emailSent: true,
  createdAt: true,
  user: { select: { id: true, username: true, email: true } },
  orderDetails: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      product: { select: { id: true, name: true } },
    },
  },
};

export const orderRepository = {
  findAll({ skip, limit, status }) {
    // status es opcional — si viene, filtra por estado además del pago confirmado
    const where = { stripeStatus: "paid", ...(status && { status }) };
    return Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        select: orderWithRelations,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);
  },

  findById(id) {
    return prisma.order.findUnique({ where: { id }, select: orderWithRelations });
  },

  findBySessionId(sessionId) {
    return prisma.order.findFirst({ where: { stripeSessionId: sessionId }, select: orderWithRelations });
  },

  // Orden con productos y usuario para procesar el webhook (descuento de stock + correos)
  // Usa include para conservar detail.idProduct y el objeto product completo
  findByIdForFulfillment(id) {
    return prisma.order.findUnique({
      where: { id },
      include: { orderDetails: { include: { product: true } }, user: true },
    });
  },

  // Crea la orden con sus detalles en una sola operación anidada (checkout)
  // items: [{ idProduct, quantity, unitPrice }]
  create({ idUser, total, items }) {
    return prisma.order.create({
      data: {
        idUser,
        total,
        status: "pendiente",
        orderDetails: {
          create: items.map((item) => ({
            idProduct: item.idProduct,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  },

  updateStripeSession(id, stripeSessionId) {
    return prisma.order.update({ where: { id }, data: { stripeSessionId } });
  },

  updateStripePayment(id, { stripeStatus, stripePaymentId }) {
    return prisma.order.update({ where: { id }, data: { stripeStatus, stripePaymentId } });
  },

  markEmailSent(id) {
    return prisma.order.update({ where: { id }, data: { emailSent: true } });
  },

  findByUser(userId, { skip, limit, status }) {
    // status es opcional — mismo where para findMany y count
    const where = { idUser: userId, stripeStatus: "paid", ...(status && { status }) };
    return Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        select: orderWithRelations,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);
  },

  updateStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status },
      select: orderWithRelations,
    });
  },
};
