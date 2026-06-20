import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", requireAuth, logout);
authRouter.get("/me", requireAuth, me);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-verification", resendVerification);

export { authRouter };
