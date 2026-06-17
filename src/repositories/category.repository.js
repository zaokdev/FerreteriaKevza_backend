import { prisma } from "../config/prisma.js";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  findById(id) {
    return prisma.category.findUnique({ where: { id } });
  },

  findByName(name) {
    return prisma.category.findUnique({ where: { name } });
  },

  create({ name }) {
    return prisma.category.create({ data: { name } });
  },

  update(id, { name }) {
    return prisma.category.update({ where: { id }, data: { name } });
  },

  delete(id) {
    return prisma.category.delete({ where: { id } });
  },
};
