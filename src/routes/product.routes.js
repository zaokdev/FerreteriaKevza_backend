import { Router } from "express";
import {
  getProducts,
  getAdminProducts,
  getFeaturedProducts,
  getLowStockProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProduct,
  setFeaturedProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
} from "../controllers/product.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { demoBlock } from "../middlewares/demoBlock.js";
import { uploadImages } from "../middlewares/upload.js";

const productRouter = Router();

// Rutas estáticas ANTES de /:id para evitar que el parámetro las capture
productRouter.get("/featured", getFeaturedProducts);
productRouter.get("/admin", requireAuth, requireRole("owner", "admin_demo"), getAdminProducts);
productRouter.get("/low-stock", requireAuth, requireRole("owner", "admin_demo"), getLowStockProducts);
productRouter.get("/search", searchProducts);

productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);

productRouter.post("/", requireAuth, requireRole("owner"), demoBlock, createProduct);
productRouter.put("/:id", requireAuth, requireRole("owner", "admin_demo"), updateProduct);
productRouter.put("/:id/toggle", requireAuth, requireRole("owner"), demoBlock, toggleProduct);
productRouter.put("/:id/featured", requireAuth, requireRole("owner"), demoBlock, setFeaturedProduct);
productRouter.delete("/:id", requireAuth, requireRole("owner"), demoBlock, deleteProduct);

productRouter.post("/:id/images", requireAuth, requireRole("owner"), demoBlock, uploadImages, uploadProductImages);
productRouter.delete("/:id/images/:imageId", requireAuth, requireRole("owner"), demoBlock, deleteProductImage);

export { productRouter };
