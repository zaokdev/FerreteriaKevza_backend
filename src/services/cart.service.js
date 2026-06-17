import { cache, hash } from "../config/redis.js";
import { productRepository } from "../repositories/product.repository.js";

const cartKey = (userId) => `carrito:${userId}`;
const CART_TTL = 60 * 60 * 24 * 7; // 7 días

export const cartService = {
  async getCart(userId) {
    const cartItems = await hash.getAll(cartKey(userId));

    if (!cartItems || Object.keys(cartItems).length === 0) {
      return { items: [], total: 0 };
    }

    const productIds = Object.keys(cartItems).map(Number);
    const products = await productRepository.findManyForCart(productIds);

    const items = products.map((product) => {
      const quantity = parseInt(cartItems[product.id]);
      return {
        productId: product.id,
        name: product.name,
        precio: product.precio,
        stock: product.stock,
        quantity,
        subtotal: parseFloat(product.precio) * quantity,
        imagePath: product.images[0]?.imagePath ?? null,
      };
    });

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { items, total };
  },

  async addItem(userId, productId, quantity) {
    if (!quantity || quantity < 1) {
      const error = new Error("La cantidad debe ser mayor a 0");
      error.status = 400;
      throw error;
    }

    const product = await productRepository.findByIdForStock(productId);
    if (!product || !product.isActive) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    const currentQty = parseInt(await hash.get(cartKey(userId), String(productId))) || 0;
    const newQty = currentQty + quantity;

    if (newQty > product.stock) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stock}`);
      error.status = 409;
      throw error;
    }

    await hash.set(cartKey(userId), String(productId), newQty);
    await hash.expire(cartKey(userId), CART_TTL);
  },

  async updateItem(userId, productId, quantity) {
    if (quantity < 0) {
      const error = new Error("La cantidad no puede ser negativa");
      error.status = 400;
      throw error;
    }

    if (quantity === 0) {
      await hash.del(cartKey(userId), String(productId));
      return;
    }

    const product = await productRepository.findByIdForStock(productId);
    if (!product || !product.isActive) {
      const error = new Error("Producto no encontrado");
      error.status = 404;
      throw error;
    }

    if (quantity > product.stock) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stock}`);
      error.status = 409;
      throw error;
    }

    await hash.set(cartKey(userId), String(productId), quantity);
    await hash.expire(cartKey(userId), CART_TTL);
  },

  async removeItem(userId, productId) {
    await hash.del(cartKey(userId), String(productId));
  },

  async clearCart(userId) {
    await cache.del(cartKey(userId));
  },
};
