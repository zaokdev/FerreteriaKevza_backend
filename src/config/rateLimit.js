import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Cliente Redis DEDICADO para rate limiting.
// Se crea aparte del de redis.js a propósito: aquel usa automaticDeserialization: false
// (necesario para connect-redis/caché), pero @upstash/ratelimit espera que sus scripts Lua
// devuelvan números/arrays ya deserializados. Reusar ese cliente causaría comparaciones erróneas.
const rateLimitRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL, // misma DB Upstash que el resto de la app
  token: process.env.UPSTASH_REDIS_REST_TOKEN, // token REST de Upstash
});

// Red de seguridad general — todo /api. Generoso: una carga de página dispara varias requests.
export const globalLimiter = new Ratelimit({
  // redis: instancia donde se guardan los contadores (los scripts Lua corren aquí, atómicos)
  redis: rateLimitRedis,
  // prefix: namespace de las keys en Redis → distingue esta capa de las demás (rl:global:<ip>)
  prefix: "rl:global",
  // limiter: algoritmo + cuota. slidingWindow(tokens, ventana):
  //   tokens = 100 → máximo de peticiones permitidas
  //   "1 m"  → por ventana deslizante de 1 minuto
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  // timeout: fail-open. Si Upstash no responde en 2000ms, deja pasar la petición en vez de
  // tumbar la tienda. Prioriza disponibilidad sobre exactitud del límite.
  timeout: 2000,
  // ephemeralCache: caché en RAM de identificadores ya bloqueados → evita ir a Upstash de nuevo
  // mientras siguen martillando. Cada limitador usa su propio Map para no colisionar keys.
  ephemeralCache: new Map(),
});

// Credenciales (login, reset-password) — frena fuerza bruta con margen para typos.
export const credentialLimiter = new Ratelimit({
  redis: rateLimitRedis, // misma DB, contador independiente gracias al prefix
  prefix: "rl:cred", // keys: rl:cred:<ip>
  limiter: Ratelimit.slidingWindow(10, "15 m"), // 10 intentos por IP cada 15 minutos
  timeout: 2000, // fail-open si Upstash cae
  ephemeralCache: new Map(), // bloqueo en RAM de IPs ya frenadas
});

// Registro — frena creación masiva de cuentas falsas y spam de correos de verificación.
export const registerLimiter = new Ratelimit({
  redis: rateLimitRedis,
  prefix: "rl:register", // keys: rl:register:<ip>
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 registros por IP cada hora
  timeout: 2000,
  ephemeralCache: new Map(),
});

// Envío de correos (forgot-password, resend-verification) — keyed por email.
// Frena el bombardeo del inbox de una víctima específica.
export const emailLimiter = new Ratelimit({
  redis: rateLimitRedis,
  prefix: "rl:email", // keys: rl:email:<email>  (el identificador es el email, no la IP)
  limiter: Ratelimit.slidingWindow(3, "1 h"), // 3 correos al mismo email cada hora
  timeout: 2000,
  ephemeralCache: new Map(),
});

// Checkout — keyed por userId. Frena el spam de sesiones de Stripe.
export const checkoutLimiter = new Ratelimit({
  redis: rateLimitRedis,
  prefix: "rl:checkout", // keys: rl:checkout:<userId>
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 checkouts por usuario cada minuto
  timeout: 2000,
  ephemeralCache: new Map(),
});
