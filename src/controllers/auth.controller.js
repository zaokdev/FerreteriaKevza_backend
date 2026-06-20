import asyncHandler from "express-async-handler";
import { authService } from "../services/auth.service.js";
import {
  ok,
  noContent,
  unauthorizedException,
  badRequestException,
} from "../utils/httpResponse.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return badRequestException(res, "username, email y password son requeridos");
  }

  await authService.register({ username, email, password });
  return ok(res, { message: "Revisa tu correo para confirmar tu cuenta" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) return badRequestException(res, "Token requerido");

  await authService.verifyEmail({ token });
  return ok(res, { message: "Correo verificado. Ya puedes iniciar sesión." });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return badRequestException(res, "El email es requerido");

  await authService.resendVerification({ email });
  return ok(res, { message: "Si tienes una verificación pendiente recibirás un nuevo correo" });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return badRequestException(res, "email y password son requeridos");
  }

  const userData = await authService.login({ email, password });

  req.session.userId = userData.id;
  req.session.username = userData.username;
  req.session.email = userData.email;
  req.session.rol = userData.rol;

  return ok(res, { user: userData });
});

export const logout = asyncHandler(async (req, res) => {
  await new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
  res.clearCookie("connect.sid");
  return noContent(res);
});

export const me = asyncHandler(async (req, res) => {
  if (!req.session?.userId) {
    return unauthorizedException(res);
  }
  return ok(res, {
    user: {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email,
      rol: req.session.rol,
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return badRequestException(res, "El email es requerido");

  await authService.forgotPassword({ email });
  return ok(res, { message: "Si el correo está registrado recibirás un enlace para restablecer tu contraseña" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return badRequestException(res, "token y password son requeridos");

  await authService.resetPassword({ token, password });
  return ok(res, { message: "Contraseña actualizada correctamente" });
});
