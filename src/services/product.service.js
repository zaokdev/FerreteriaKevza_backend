import { cache } from "../config/redis.js";
import { productRepository } from "../repositories/product.repository.js";
import { getPagination, paginatedResponse } from "../utils/pagination.js";
import { buildImagePath, uploadImage, deleteImage as deleteFromStorage } from "../config/storage.js";

const CACHE_CATALOGO = "catalogo";
const CACHE_FEATURED = "featured";
const TTL_1H = 60 * 60;

const invalidateCatalogo = () => cache.del(CACHE_CATALOGO);
const invalidateFeatured = () => cache.del(CACHE_FEATURED);

export const productService = {
  async getAll(query) {
    const { page, limit, skip } = getPagination(query);

    const cached = await cache.get(CACHE_CATALOGO);
    if (cached) {
      const allProducts = cached;
      const paginated = allProducts.slice(skip, skip + limit);
      return paginatedResponse(paginated, allProducts.length, page, limit);
    }

    const allProducts = await productRepository.findAllActive();
    await cache.set(CACHE_CATALOGO, allProducts, TTL_1H);

    const paginated = allProducts.slice(skip, skip + limit);
    return paginatedResponse(paginated, allProducts.length, page, limit);
  },

  async getFeatured() {
    const cached = await cache.get(CACHE_FEATURED);
    if (cached) return cached;

    const products = await productRepository.findFeatured();
    await cache.set(CACHE_FEATURED, products, TTL_1H);
    return products;
  },

  async getLowStock(threshold = 5) {
    return productRepository.findLowStock(threshold);
  },

  async search(query) {
    const { page, limit, skip } = getPagination(query);
    const { name, category, minPrice, maxPrice, inStock } = query;

    const categoryId = category ? parseInt(category) : undefined;
    const min = minPrice ? parseFloat(minPrice) : undefined;
    const max = maxPrice ? parseFloat(maxPrice) : undefined;

    const [products, total] = await productRepository.search({
      name,
      categoryId,
      minPrice: min,
      maxPrice: max,
      inStock: inStock === "true",
      skip,
      limit,
    });

    return paginatedResponse(products, total, page, limit);
  },

  async getById(id, isAdmin = false) {
    const product = await productRepository.findById(id);
    if (!product || (!isAdmin && !product.isActive)) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }
    return product;
  },

  async getAllForAdmin(query) {
    const { page, limit, skip } = getPagination(query);
    const { name, category, isActive } = query;

    const categoryId = category ? parseInt(category) : undefined;
    const isActiveFilter =
      isActive === "true" ? true : isActive === "false" ? false : undefined;

    const [products, total] = await productRepository.findAllAdmin({
      skip,
      limit,
      name,
      categoryId,
      isActive: isActiveFilter,
    });
    return paginatedResponse(products, total, page, limit);
  },

  async create(data) {
    const product = await productRepository.create(data);
    await invalidateCatalogo();
    if (product.isFeatured) await invalidateFeatured();
    return product;
  },

  async update(id, data) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const updated = await productRepository.update(id, data);
    await invalidateCatalogo();

    // Invalida featured si cambió isFeatured o si el producto era/es featured
    if (
      data.isFeatured !== undefined ||
      existing.isFeatured ||
      updated.isFeatured
    ) {
      await invalidateFeatured();
    }

    return updated;
  },

  async delete(id) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const orderCount = await productRepository.countOrderDetails(id);
    if (orderCount > 0) {
      const error = new Error(
        "No se puede eliminar un producto con órdenes asociadas. Desactívalo en su lugar."
      );
      error.status = 409;
      throw error;
    }

    // Eliminar archivos de Supabase Storage antes de borrar registros
    for (const image of existing.images) {
      await deleteFromStorage(image.imagePath);
    }

    // Eliminar registros de imagen (FK constraint — no hay cascade en el schema)
    await productRepository.deleteImagesByProduct(id);

    await productRepository.delete(id);
    await invalidateCatalogo();
    if (existing.isFeatured) await invalidateFeatured();
  },

  async toggleActive(id) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const updated = await productRepository.update(id, {
      isActive: !existing.isActive,
    });
    await invalidateCatalogo();
    return updated;
  },

  async setFeatured(id, isFeatured) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const updated = await productRepository.update(id, { isFeatured });
    await invalidateFeatured();
    return updated;
  },

  async uploadImages(id, files) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const { _max } = await productRepository.maxImageOrden(id);
    let nextOrden = (_max.orden ?? -1) + 1;

    const newImages = [];
    for (const file of files) {
      const imagePath = buildImagePath(id, nextOrden, file.originalname);
      await uploadImage(imagePath, file.buffer, file.mimetype);
      newImages.push({ imagePath, orden: nextOrden });
      nextOrden++;
    }

    await productRepository.createImages(id, newImages);
    await invalidateCatalogo();
    if (existing.isFeatured) await invalidateFeatured();

    return productRepository.findById(id);
  },

  async deleteImage(productId, imageId) {
    const image = await productRepository.findImageById(imageId);
    if (!image || image.idProduct !== productId) {
      const error = new Error("Imagen no encontrada");
      error.status = 404;
      throw error;
    }

    await deleteFromStorage(image.imagePath);
    await productRepository.deleteImage(imageId);
    await invalidateCatalogo();

    const product = await productRepository.findById(productId);
    if (product.isFeatured) await invalidateFeatured();
  },
};
