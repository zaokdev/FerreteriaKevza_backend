import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { demoBlock } from "../middlewares/demoBlock.js";

const categoryRouter = Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", requireAuth, requireRole("owner"), demoBlock, createCategory);
categoryRouter.put("/:id", requireAuth, requireRole("owner"), demoBlock, updateCategory);
categoryRouter.delete("/:id", requireAuth, requireRole("owner"), demoBlock, deleteCategory);

export { categoryRouter };
