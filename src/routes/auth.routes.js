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
import { rateLimit } from "../middlewares/rateLimit.js";
import {
  credentialLimiter,
  registerLimiter,
  emailLimiter,
} from "../config/rateLimit.js";

const authRouter = Router();

// Las funciones que envían correo (forgot-password, resend-verification) se agrupan por email
// para frenar el bombardeo al inbox de una víctima concreta.
const byEmail = (req) => req.body.email;

authRouter.post("/register", rateLimit(registerLimiter), register);
authRouter.post("/login", rateLimit(credentialLimiter), login);
authRouter.post("/logout", requireAuth, logout);
authRouter.get("/me", requireAuth, me);
authRouter.post("/forgot-password", rateLimit(emailLimiter, byEmail), forgotPassword);
authRouter.post("/reset-password", rateLimit(credentialLimiter), resetPassword);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/resend-verification", rateLimit(emailLimiter, byEmail), resendVerification);

export { authRouter };
