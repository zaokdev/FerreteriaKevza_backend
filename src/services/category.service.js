import { cache } from "../config/redis.js";
import { categoryRepository } from "../repositories/category.repository.js";

const CACHE_KEY = "categorias";
const CACHE_TTL = 60 * 60 * 24; // 24 horas

export const categoryService = {
  async getAll() {
    const cached = await cache.get(CACHE_KEY);
    if (cached) return cached;

    const categories = await categoryRepository.findAll();
    await cache.set(CACHE_KEY, categories, CACHE_TTL);
    return categories;
  },

  async create({ name }) {
    if (!name?.trim()) {
      const error = new Error("El nombre de la categoría es requerido");
      error.status = 400;
      throw error;
    }

    const existing = await categoryRepository.findByName(name.trim());
    if (existing) {
      const error = new Error("Ya existe una categoría con ese nombre");
      error.status = 409;
      throw error;
    }

    const category = await categoryRepository.create({ name: name.trim() });
    await cache.del(CACHE_KEY);
    return category;
  },

  async update(id, { name }) {
    if (!name?.trim()) {
      const error = new Error("El nombre de la categoría es requerido");
      error.status = 400;
      throw error;
    }

    const existing = await categoryRepository.findById(id);
    if (!existing) {
      const error = new Error("Categoría no encontrada");
      error.status = 404;
      throw error;
    }

    const conflict = await categoryRepository.findByName(name.trim());
    if (conflict && conflict.id !== id) {
      const error = new Error("Ya existe una categoría con ese nombre");
      error.status = 409;
      throw error;
    }

    const updated = await categoryRepository.update(id, { name: name.trim() });
    await cache.del(CACHE_KEY);
    return updated;
  },

  async delete(id) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      const error = new Error("Categoría no encontrada");
      error.status = 404;
      throw error;
    }

    await categoryRepository.delete(id);
    await cache.del(CACHE_KEY);
  },
};
