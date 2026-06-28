import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().max(5000).nullable().optional(),
  precio: z
    .number({ invalid_type_error: "El precio debe ser un número" })
    .positive("El precio debe ser mayor a 0"),
  stock: z
    .number({ invalid_type_error: "El stock debe ser un número" })
    .int()
    .nonnegative("El stock no puede ser negativo"),
  idCategory: z
    .number({ invalid_type_error: "La categoría es requerida" })
    .int()
    .positive(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
