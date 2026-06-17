import { Router } from "express";
import { getUsers, getUserById, banUser } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { demoBlock } from "../middlewares/demoBlock.js";

const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/", requireRole("owner", "admin_demo"), getUsers);
userRouter.get("/:id", requireRole("owner", "admin_demo"), getUserById);
userRouter.put("/:id/ban", requireRole("owner"), demoBlock, banUser);

export { userRouter };
