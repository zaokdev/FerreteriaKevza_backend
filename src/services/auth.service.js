import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { cache } from "../config/redis.js";
import { sendMail } from "../config/mailer.js";
import { passwordResetEmail, emailVerificationEmail } from "../utils/email.templates.js";
import { logger } from "../config/logger.js";

const RESET_TTL = 60 * 15; // 15 minutos
const VERIFY_TTL = 60 * 60 * 24; // 24 horas

const resetKey = (token) => `reset:${token}`;
const verifyKey = (token) => `verify:${token}`;
const verifyEmailKey = (email) => `verify:email:${email}`;

export const authService = {
  async register({ username, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    // Respuesta idéntica si el email existe o no — evita enumeración de usuarios
    if (existingUser) return;

    const hashedPassword = await bcrypt.hash(password, 10);

    const clienteRole = await roleRepository.findByName("cliente");
    if (!clienteRole) {
      const error = new Error("Rol 'cliente' no encontrado — ejecutar seed");
      error.status = 500;
      throw error;
    }

    // Invalidar token pendiente anterior si existe para este email
    const existingToken = await cache.get(verifyEmailKey(email));
    if (existingToken) {
      await cache.del(verifyKey(existingToken));
    }

    const token = crypto.randomBytes(32).toString("hex");
    const payload = { username, email, hashedPassword, idRole: clienteRole.id };

    await cache.set(verifyKey(token), payload, VERIFY_TTL);
    await cache.set(verifyEmailKey(email), token, VERIFY_TTL);

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const { subject, html } = emailVerificationEmail({ verifyUrl });
    await sendMail({ to: email, subject, html });
  },

  async verifyEmail({ token }) {
    const payload = await cache.get(verifyKey(token));
    if (!payload) {
      const error = new Error("Token inválido o expirado");
      error.status = 400;
      throw error;
    }

    const { username, email, hashedPassword, idRole } = payload;

    const newUser = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      idRole,
      isVerified: true,
    });

    await cache.del(verifyKey(token));
    await cache.del(verifyEmailKey(email));

    return { id: newUser.id, username: newUser.username, email: newUser.email, rol: newUser.role.name };
  },

  async resendVerification({ email }) {
    // Si el email ya existe en DB (verificado o no) → respuesta genérica
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) return;

    // Si no hay token pendiente → respuesta genérica (no hay registro pendiente)
    const existingToken = await cache.get(verifyEmailKey(email));
    if (!existingToken) return;

    // Recuperar el payload del token viejo
    const payload = await cache.get(verifyKey(existingToken));
    // Si el payload ya expiró (caso borde: las dos keys no expiraron en sinconía) → salir
    if (!payload) return;

    await cache.del(verifyKey(existingToken));

    const newToken = crypto.randomBytes(32).toString("hex");
    await cache.set(verifyKey(newToken), payload, VERIFY_TTL);
    await cache.set(verifyEmailKey(email), newToken, VERIFY_TTL);

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${newToken}`;
    const { subject, html } = emailVerificationEmail({ verifyUrl });
    await sendMail({ to: email, subject, html });
  },

  async login({ email, password, ip }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`Login fallido — email no encontrado: ${email} | ip: ${ip}`);
      const error = new Error("Credenciales incorrectas");
      error.status = 401;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`Login fallido — password incorrecto: userId=${user.id} email=${email} | ip: ${ip}`);
      const error = new Error("Credenciales incorrectas");
      error.status = 401;
      throw error;
    }

    if (!user.isVerified) {
      logger.warn(`Login fallido — email no verificado: userId=${user.id} email=${email} | ip: ${ip}`);
      const error = new Error("Debes verificar tu email antes de iniciar sesión");
      error.status = 403;
      throw error;
    }

    if (user.isBanned) {
      logger.warn(`Login fallido — cuenta suspendida: userId=${user.id} email=${email} | ip: ${ip}`);
      const error = new Error("Cuenta suspendida");
      error.status = 403;
      throw error;
    }

    const roleRecord = await roleRepository.findById(user.idRole);

    logger.info(`Login exitoso: userId=${user.id} email=${email} rol=${roleRecord.name} | ip: ${ip}`);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      rol: roleRecord.name,
    };
  },

  async forgotPassword({ email }) {
    const user = await userRepository.findByEmail(email);
    // Respuesta idéntica si el email existe o no — evita enumeración de usuarios
    if (!user) return;

    const token = crypto.randomBytes(32).toString("hex");
    await cache.set(resetKey(token), user.id, RESET_TTL);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const { subject, html } = passwordResetEmail({ resetUrl });

    await sendMail({ to: email, subject, html });
  },

  async resetPassword({ token, password }) {
    const userId = await cache.get(resetKey(token));
    if (!userId) {
      const error = new Error("Token inválido o expirado");
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.updatePassword(userId, hashedPassword);
    await cache.del(resetKey(token));
  },
};
