import { transporter } from "../config/mailer.js";
import { orderRepository } from "../repositories/order.repository.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { orderStatusChanged } from "../utils/email.templates.js";

const VALID_STATUSES = ["pendiente", "cancelado", "enviado", "entregado"];

export const orderService = {
  async getAll(query) {
    const { page, limit, skip } = getPagination(query);
    // Solo se aplica el filtro si el estado es válido; cualquier otro valor se ignora
    const status = VALID_STATUSES.includes(query.status) ? query.status : undefined;
    const [orders, total] = await orderRepository.findAll({ skip, limit, status });
    return paginatedResponse(orders, total, page, limit);
  },

  async getById(id) {
    const order = await orderRepository.findById(id);
    if (!order) {
      const error = new Error("Orden no encontrada");
      error.status = 404;
      throw error;
    }
    return order;
  },

  async getByUser(userId, query) {
    const { page, limit, skip } = getPagination(query);
    const [orders, total] = await orderRepository.findByUser(userId, { skip, limit });
    return paginatedResponse(orders, total, page, limit);
  },

  async getByUserAdmin(userId, query) {
    const { page, limit, skip } = getPagination(query);
    const status = VALID_STATUSES.includes(query.status) ? query.status : undefined;
    const [orders, total] = await orderRepository.findByUser(userId, { skip, limit, status });
    return paginatedResponse(orders, total, page, limit);
  },

  async updateStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
      const error = new Error(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`);
      error.status = 400;
      throw error;
    }

    const existing = await orderRepository.findById(id);
    if (!existing) {
      const error = new Error("Orden no encontrada");
      error.status = 404;
      throw error;
    }

    const updated = await orderRepository.updateStatus(id, status);

    // Enviar correo de cambio de estado al cliente
    const template = orderStatusChanged({ order: updated, newStatus: status });
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: updated.user.email,
      ...template,
    });

    return updated;
  },
};
