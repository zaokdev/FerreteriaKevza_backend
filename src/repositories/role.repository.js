import { prisma } from "../config/prisma.js";

export const roleRepository = {
  findByName(name) {
    return prisma.role.findUnique({ where: { name } });
  },

  findById(id) {
    return prisma.role.findUnique({ where: { id } });
  },
};
