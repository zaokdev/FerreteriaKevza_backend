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

  findAll({ skip, limit, search }) {
    // Búsqueda por nombre de usuario o correo — case-insensitive por la collation de MySQL
    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined;

    return Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: userSelect,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
  },

  create({ username, email, password, idRole, isVerified = false }) {
    return prisma.user.create({
      data: { username, email, password, idRole, isVerified },
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
