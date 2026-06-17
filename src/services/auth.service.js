import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepository } from "../repositories/user.repository.js";
import { roleRepository } from "../repositories/role.repository.js";
import { cache } from "../config/redis.js";
import { transporter } from "../config/mailer.js";
import { passwordResetEmail } from "../utils/email.templates.js";

const RESET_TTL = 60 * 15; // 15 minutos
const resetKey = (token) => `reset:${token}`;

export const authService = {
  async register({ username, email, password }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error("El correo ya está registrado");
      error.status = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const clienteRole = await roleRepository.findByName("cliente");
    if (!clienteRole) {
      const error = new Error("Rol 'cliente' no encontrado — ejecutar seed");
      error.status = 500;
      throw error;
    }

    const newUser = await userRepository.create({
      username,
      email,
      password: hashedPassword,
      idRole: clienteRole.id,
    });

    return { id: newUser.id, username: newUser.username, email: newUser.email, rol: newUser.role.name };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Credenciales incorrectas");
      error.status = 401;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const error = new Error("Credenciales incorrectas");
      error.status = 401;
      throw error;
    }

    if (user.isBanned) {
      const error = new Error("Cuenta suspendida");
      error.status = 403;
      throw error;
    }

    const roleRecord = await roleRepository.findById(user.idRole);

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

    await transporter.sendMail({ to: email, subject, html });
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
