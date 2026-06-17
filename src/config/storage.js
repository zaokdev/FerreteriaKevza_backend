import { createClient } from "@supabase/supabase-js";
import path from "path";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET;

// Path convention: productos/<productId>/<orden>.<ext>
// Ejemplo: productos/42/1.jpg, productos/42/2.jpg
export const buildImagePath = (productId, orden, filename) => {
  const ext = path.extname(filename) || ".jpg";
  return `productos/${productId}/${orden}${ext}`;
};

// Sube un archivo al bucket. Recibe el path relativo construido con buildImagePath.
export const uploadImage = async (imagePath, file, mimetype) => {
  const { error } = await supabase.storage.from(BUCKET).upload(imagePath, file, {
    upsert: true,
    contentType: mimetype,
  });
  if (error) throw new Error(`Error al subir imagen: ${error.message}`);
  return imagePath;
};

// Elimina un archivo del bucket por su path relativo.
export const deleteImage = async (imagePath) => {
  const { error } = await supabase.storage.from(BUCKET).remove([imagePath]);
  if (error) throw new Error(`Error al eliminar imagen: ${error.message}`);
};

// Construye la URL pública a partir del imagePath guardado en DB.
// Nunca se guarda la URL completa — solo el path relativo.
export const getImageUrl = (imagePath) => {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${imagePath}`;
};
