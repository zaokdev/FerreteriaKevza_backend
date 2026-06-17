import { prisma } from "../config/prisma.js";

const productWithRelations = {
  id: true,
  name: true,
  description: true,
  stock: true,
  precio: true,
  isActive: true,
  isFeatured: true,
  idCategory: true,
  category: { select: { id: true, name: true } },
  images: { select: { id: true, imagePath: true, orden: true }, orderBy: { orden: "asc" } },
};

export const productRepository = {
  findAll({ skip, limit }) {
    return Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        select: productWithRelations,
        orderBy: { id: "desc" },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);
  },

  findAllAdmin({ skip, limit, name, categoryId, isActive }) {
    const where = {};
    if (name) where.name = { contains: name, mode: "insensitive" };
    if (categoryId !== undefined) where.idCategory = categoryId;
    if (isActive !== undefined) where.isActive = isActive;

    return Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        select: productWithRelations,
        orderBy: { id: "desc" },
      }),
      prisma.product.count({ where }),
    ]);
  },

  findAllActive() {
    return prisma.product.findMany({
      where: { isActive: true },
      select: productWithRelations,
      orderBy: { id: "desc" },
    });
  },

  findById(id) {
    return prisma.product.findUnique({ where: { id }, select: productWithRelations });
  },

  // Datos mínimos para validar stock — evita traer category e images
  findByIdForStock(id) {
    return prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, isActive: true, stock: true },
    });
  },

  // Productos del carrito con solo la primera imagen (orden asc)
  findManyForCart(productIds) {
    return prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        name: true,
        precio: true,
        stock: true,
        images: { select: { imagePath: true }, orderBy: { orden: "asc" }, take: 1 },
      },
    });
  },

  findFeatured() {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      select: productWithRelations,
    });
  },

  findLowStock(threshold) {
    return prisma.product.findMany({
      where: { isActive: true, stock: { lte: threshold } },
      select: productWithRelations,
      orderBy: { stock: "asc" },
    });
  },

  search({ name, categoryId, minPrice, maxPrice, inStock, skip, limit }) {
    const where = { isActive: true };

    if (name) where.name = { contains: name, mode: "insensitive" };
    if (categoryId) where.idCategory = categoryId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.precio = {};
      if (minPrice !== undefined) where.precio.gte = minPrice;
      if (maxPrice !== undefined) where.precio.lte = maxPrice;
    }
    if (inStock) where.stock = { gt: 0 };

    return Promise.all([
      prisma.product.findMany({ where, skip, take: limit, select: productWithRelations }),
      prisma.product.count({ where }),
    ]);
  },

  create({ name, stock, precio, idCategory, isFeatured, images }) {
    return prisma.product.create({
      data: {
        name,
        stock,
        precio,
        idCategory,
        isFeatured: isFeatured ?? false,
        images: images?.length
          ? { create: images.map((imagePath, index) => ({ imagePath, orden: index })) }
          : undefined,
      },
      select: productWithRelations,
    });
  },

  update(id, { name, stock, precio, idCategory, isFeatured, isActive }) {
    const data = {};
    if (name !== undefined) data.name = name;
    if (stock !== undefined) data.stock = stock;
    if (precio !== undefined) data.precio = precio;
    if (idCategory !== undefined) data.idCategory = idCategory;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isActive !== undefined) data.isActive = isActive;

    return prisma.product.update({ where: { id }, data, select: productWithRelations });
  },

  delete(id) {
    return prisma.product.delete({ where: { id } });
  },

  // Descuenta stock de varios productos en una transacción atómica
  // items: [{ idProduct, quantity }]
  decrementStock(items) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.idProduct },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );
  },

  findImagesByProduct(productId) {
    return prisma.imageProduct.findMany({
      where: { idProduct: productId },
      orderBy: { orden: "asc" },
    });
  },

  findImageById(imageId) {
    return prisma.imageProduct.findUnique({ where: { id: imageId } });
  },

  createImages(productId, images) {
    // images: [{ imagePath, orden }]
    return prisma.imageProduct.createMany({ data: images.map((img) => ({ ...img, idProduct: productId })) });
  },

  deleteImage(imageId) {
    return prisma.imageProduct.delete({ where: { id: imageId } });
  },

  deleteImagesByProduct(productId) {
    return prisma.imageProduct.deleteMany({ where: { idProduct: productId } });
  },

  countOrderDetails(productId) {
    return prisma.orderDetails.count({ where: { idProduct: productId } });
  },

  maxImageOrden(productId) {
    return prisma.imageProduct.aggregate({
      where: { idProduct: productId },
      _max: { orden: true },
    });
  },
};
