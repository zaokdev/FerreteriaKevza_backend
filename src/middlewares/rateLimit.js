import { tooManyRequestsException } from "../utils/httpResponse.js";

// Factory de middleware de rate limiting.
// Recibe un limitador de config/rateLimit.js y una función para extraer el identificador
// (la "key" que agrupa el conteo). Por defecto agrupa por IP.
//
// Uso:
//   rateLimit(credentialLimiter)                          → agrupa por req.ip
//   rateLimit(emailLimiter, (req) => req.body.email)      → agrupa por email
//   rateLimit(checkoutLimiter, (req) => req.session.userId) → agrupa por usuario
export const rateLimit = (limiter, getKey = (req) => req.ip) => async (req, res, next) => {
  // Si el extractor no devuelve nada (ej. body sin email), caemos a la IP para no
  // agrupar a todos los usuarios bajo una key vacía y bloquearlos juntos.
  const identifier = getKey(req) || req.ip;

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  // Headers estándar para que el cliente sepa su cuota restante
  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", reset);

  if (!success) {
    // reset es timestamp en ms → Retry-After se expresa en segundos desde ahora
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds);
    return tooManyRequestsException(res);
  }

  next();
};
