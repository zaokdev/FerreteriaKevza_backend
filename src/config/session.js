import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient } from "./redis.js";

// Frontend y backend viven en dominios distintos en producción (CORS con
// credentials: true lo confirma). Sin sameSite=none, el navegador aplica
// el default "Lax" y descarta la cookie en requests cross-site hechos con
// fetch/XHR (Axios) — el login parece funcionar pero ninguna petición
// posterior (auth/me, cart/items) llega con sesión. sameSite=none exige
// secure=true, ya activo en producción.
// Se exporta para que logout use exactamente las mismas opciones al limpiar
// la cookie — un mismatch en secure/sameSite puede impedir que se borre.
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24, // 24 horas
};

export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: sessionCookieOptions,
});
