import { prisma } from "../config/prisma.js";

const userSelect = {
  id: true,
  username: true,
  email: true,
  isVerified: true,
  isBanned: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
};

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },

  findAll({ skip, limit }) {
    return Promise.all([
      prisma.user.findMany({ skip, take: limit, select: userSelect, orderBy: { createdAt: "desc" } }),
      prisma.user.count(),
    ]);
  },

  create({ username, email, password, idRole }) {
    return prisma.user.create({
      data: { username, email, password, idRole },
      select: userSelect,
    });
  },

  ban(id, isBanned) {
    return prisma.user.update({
      where: { id },
      data: { isBanned },
      select: userSelect,
    });
  },

  updatePassword(id, hashedPassword) {
    return prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  },
};
