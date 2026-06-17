import { Redis } from "@upstash/redis";

// automaticDeserialization: false → client siempre devuelve/recibe strings crudos.
// La capa cache hace el JSON explícitamente; connect-redis recibe strings sin conversión circular.
const client = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  automaticDeserialization: false,
});

// --- Capa de abstracción de caché ---
// Para migrar de proveedor, solo cambiar este archivo.
export const cache = {
  async get(key) {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  },
  set(key, value, ttlSeconds) {
    return client.set(key, JSON.stringify(value), { ex: ttlSeconds });
  },
  del(key) {
    return client.del(key);
  },
};

// --- Capa de abstracción de hashes (carrito) ---
export const hash = {
  async getAll(key) {
    const result = await client.hgetall(key);
    if (!result) return {};
    // Con automaticDeserialization: false, Upstash devuelve un array plano
    // [campo, valor, campo, valor, ...] en vez de objeto. Lo normalizamos a { campo: valor }.
    if (Array.isArray(result)) {
      const normalized = {};
      for (let i = 0; i < result.length; i += 2) {
        normalized[result[i]] = result[i + 1];
      }
      return normalized;
    }
    return result;
  },
  get(key, field) {
    return client.hget(key, field);
  },
  set(key, field, value) {
    return client.hset(key, { [field]: String(value) });
  },
  del(key, field) {
    return client.hdel(key, field);
  },
  expire(key, ttlSeconds) {
    return client.expire(key, ttlSeconds);
  },
};

// Proxy para connect-redis (sesiones).
// connect-redis v7 detecta `isOpen` para elegir la sintaxis de set:
//   - con isOpen → node-redis path: set(key, val, { EX: ttl })
//   - sin isOpen → ioredis path:    set(key, val, 'EX', ttl)
// Upstash usa { ex: ttl } (minúsculas), así que adaptamos aquí.
export const redisClient = {
  isOpen: true,
  get: (key) => client.get(key),
  set: (key, val, opts) => {
    if (opts?.EX) return client.set(key, val, { ex: opts.EX });
    return client.set(key, val);
  },
  del: (...keys) => client.del(...keys),
  expire: (key, ttl) => client.expire(key, ttl),
  mget: (...keys) => client.mget(...keys),
};
