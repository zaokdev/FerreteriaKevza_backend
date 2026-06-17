import { transporter } from "../config/mailer.js";
import { orderRepository } from "../repositories/order.repository.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { orderStatusChanged } from "../utils/email.templates.js";

export const orderService = {
  async getAll(query) {
    const { page, limit, skip } = getPagination(query);
    const [orders, total] = await orderRepository.findAll({ skip, limit });
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
    const [orders, total] = await orderRepository.findByUser(userId, { skip, limit });
    return paginatedResponse(orders, total, page, limit);
  },

  async updateStatus(id, status) {
    const validStatuses = ["pendiente", "cancelado", "enviado", "entregado"];
    if (!validStatuses.includes(status)) {
      const error = new Error(`Estado inválido. Valores permitidos: ${validStatuses.join(", ")}`);
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
