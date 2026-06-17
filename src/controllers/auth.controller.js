import asyncHandler from "express-async-handler";
import { authService } from "../services/auth.service.js";
import {
  ok,
  created,
  noContent,
  unauthorizedException,
  badRequestException,
} from "../utils/httpResponse.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email y password son requeridos" });
  }

  const userData = await authService.register({ username, email, password });

  req.session.userId = userData.id;
  req.session.username = userData.username;
  req.session.email = userData.email;
  req.session.rol = userData.rol;

  return created(res, { user: userData });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email y password son requeridos" });
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
  // Siempre 200 aunque el email no exista
  return ok(res, { message: "Si el correo está registrado recibirás un enlace para restablecer tu contraseña" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return badRequestException(res, "token y password son requeridos");

  await authService.resetPassword({ token, password });
  return ok(res, { message: "Contraseña actualizada correctamente" });
});
