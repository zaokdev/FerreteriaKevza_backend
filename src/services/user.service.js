import { userRepository } from "../repositories/user.repository.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";

export const userService = {
  async getAll(query) {
    const { page, limit, skip } = getPagination(query);
    const search = query.search?.trim() || undefined;
    const [users, total] = await userRepository.findAll({ skip, limit, search });
    return paginatedResponse(users, total, page, limit);
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }
    return user;
  },

  async ban(id, isBanned) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.status = 404;
      throw error;
    }
    return userRepository.ban(id, isBanned);
  },
};
