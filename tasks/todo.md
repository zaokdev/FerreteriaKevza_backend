# Tareas pendientes — Ferretería Kevza

> Última actualización: 2026-06-20
> Backend: API completa — falta rate limiting (tarea actual). Frontend: ~70% completo.

---

## 🔒 Tarea actual: Rate Limiting (backend)

**Objetivo:** proteger la API contra abuso (fuerza bruta en login, bombardeo de
correos en forgot-password/resend, spam de checkout) usando `@upstash/ratelimit`
con algoritmo **sliding window**, coherente con el Redis (Upstash) ya en uso.

### Diseño por capas

| Limitador           | Endpoints                                | Límite       | Key (identificador)  | Protege contra                       |
| ------------------- | ---------------------------------------- | ------------ | -------------------- | ------------------------------------ |
| `globalLimiter`     | todo `/api/*` (excepto health y webhook) | 100 / 1 min  | `req.ip`             | abuso general                        |
| `credentialLimiter` | `login`, `reset-password`                | 10 / 15 min  | `req.ip`             | fuerza bruta (con margen para typos) |
| `registerLimiter`   | `register`                               | 5 / 1 h      | `req.ip`             | cuentas falsas + spam de correo      |
| `emailLimiter`      | `forgot-password`, `resend-verification` | 3 / 1 h      | `req.body.email`     | bombardeo de inbox a una víctima     |
| `checkoutLimiter`   | `POST /checkout`                         | 10 / 1 min   | `req.session.userId` | spam de sesiones Stripe              |

> Todos usan algoritmo **sliding window**.
> El webhook de Stripe (`/webhook/stripe`) **nunca** se rate-limita — está fuera de `/api` y lo llama Stripe, no un cliente.
> `forgot-password` y `resend-verification` se protegen con `emailLimiter` (por email, frena el bombardeo a una víctima) + el `globalLimiter` por IP que ya cubre el volumen del atacante. No necesitan limitador de IP propio: `forgotPassword` ignora emails no registrados, así que solo se puede enviar a correos reales.
> `login`, `register` y `reset-password` van en limitadores **separados** (contadores independientes): protegen amenazas distintas y necesitan ventanas distintas.

### Paso 1 — Dependencia

- [x] `npm install @upstash/ratelimit` (en `backend/`). `@upstash/redis` ya está instalado.

### Paso 2 — Helper HTTP 429

**Archivo a modificar:** `src/utils/httpResponse.js`

- [x] Agregar `tooManyRequestsException(res, message = "Demasiadas solicitudes, intenta más tarde")` → status 429
- [ ] Agregarlo a la tabla de referencia rápida del CLAUDE.md del backend (doc) — pendiente

### Paso 3 — Configuración de limitadores

**Archivo a crear:** `src/config/rateLimit.js`

- [x] Crear cliente Redis dedicado (`new Redis({ url, token })`, **sin** `automaticDeserialization: false`)
- [x] Exportar `globalLimiter` (100/1m), `credentialLimiter` (10/15m), `registerLimiter` (5/1h), `emailLimiter` (3/1h), `checkoutLimiter` (10/1m) con `Ratelimit.slidingWindow(...)`
- [x] Activar `ephemeralCache` (caché en RAM de IPs ya bloqueadas → menos llamadas a Upstash)
- [x] Configurar `timeout` (fail-open: si Upstash no responde, deja pasar — no tumbar la tienda)
- [x] `prefix` distinto por limitador (`rl:global`, `rl:cred`, `rl:register`, `rl:email`, `rl:checkout`)

### Paso 4 — Middleware factory

**Archivo a crear:** `src/middlewares/rateLimit.js`

- [x] `rateLimit(limiter, getKey = (req) => req.ip)` → middleware async
- [x] Setear headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- [x] Si `!success` → `tooManyRequestsException(res)` (y header `Retry-After` desde `reset`)
- [x] Si `getKey` devuelve `undefined`/vacío → fallback a `req.ip` (evita agrupar a todos bajo una key vacía)

### Paso 5 — Aplicar en rutas

**`src/index.js`**
- [x] `app.set("trust proxy", 1)` (solo así `req.ip` es la real detrás de proxy en producción)
- [x] `app.use("/api", rateLimit(globalLimiter))` — **después** del registro de `/api/health`, antes de los routers

**`src/routes/auth.routes.js`**
- [x] `login`, `reset-password` → `rateLimit(credentialLimiter)`
- [x] `register` → `rateLimit(registerLimiter)`
- [x] `forgot-password`, `resend-verification` → `rateLimit(emailLimiter, (req) => req.body.email)`

**`src/routes/checkout.routes.js`**
- [x] `POST /` → `rateLimit(checkoutLimiter, (req) => req.session.userId)` (después de `requireAuth`)

### Paso 6 — Verificación (a cargo del usuario)

> Código compila (`node --check` OK en los 6 archivos). El testeo en runtime lo hace el usuario.

- [ ] `npm run dev` arranca sin errores
- [ ] Login: 11 intentos rápidos con misma IP → el 11º devuelve **429** + headers correctos (límite 10/15m)
- [ ] `/api/health` NO se ve afectado por el límite global
- [ ] Webhook de Stripe sigue respondiendo (no rate-limitado)
- [ ] Un request normal devuelve `X-RateLimit-Remaining` decreciente
- [ ] Confirmar que con Upstash caído (simular timeout) la API hace fail-open, no se cuelga

### Notas

- No se añaden variables de entorno nuevas (reusa `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
- `analytics: true` es opcional (dashboard de Upstash) — dejarlo apagado para no gastar comandos extra salvo que se quiera mostrar en el portafolio.
- Documentar la nueva arquitectura de rate limiting en `backend/CLAUDE.md` al terminar.

---

## Estado general

| Área | Estado |
|------|--------|
| Backend (API, rutas, DB, Redis, Stripe, email) | ✅ Completo |
| Backend — rate limiting | ⏳ En progreso (tarea actual) |
| Frontend — tienda del cliente | ✅ Completo |
| Frontend — auth (login, register, verify, forgot/reset password) | ✅ Completo |
| Frontend — admin dashboard | ✅ Completo |
| Frontend — admin productos | ✅ Completo |
| Frontend — admin órdenes | ❌ Pendiente |
| Frontend — admin usuarios | ❌ Pendiente |
| Frontend — perfil de usuario | ❌ Pendiente |

---

## Pendientes

### 1. Página `/admin/orders` — Gestión de órdenes

**Archivos a crear:**
- `frontend/src/pages/admin/Orders/index.tsx`
- `frontend/src/pages/admin/Orders/OrdersTable.tsx` (tabla paginada)
- `frontend/src/pages/admin/Orders/OrderDetailDrawer.tsx` (detalle + cambio de estado)
- `frontend/src/hooks/useAdminOrders.ts`
- `frontend/src/hooks/useUpdateOrderStatus.ts`

**Funcionalidad:**
- [ ] Tabla paginada de órdenes (`GET /orders?page&limit`)
- [ ] Columnas: ID, usuario, total, status, fecha
- [ ] Badge de color por status (pendiente / enviado / entregado / cancelado)
- [ ] Drawer de detalle al hacer clic en una fila (`GET /orders/:id`)
- [ ] Selector de status con confirmación (`PUT /orders/:id/status`) — solo owner, bloqueado en admin_demo
- [ ] Skeleton mientras carga

**Agregar ruta en `App.tsx`:**
```tsx
<Route path="orders" element={<AdminOrdersPage />} />
```

---

### 2. Página `/admin/users` — Gestión de usuarios

**Archivos a crear:**
- `frontend/src/pages/admin/Users/index.tsx`
- `frontend/src/pages/admin/Users/UsersTable.tsx` (tabla paginada)
- `frontend/src/pages/admin/Users/UserDetailDrawer.tsx` (detalle + historial de órdenes)
- `frontend/src/hooks/useAdminUsers.ts`
- `frontend/src/hooks/useBanUser.ts`

**Funcionalidad:**
- [ ] Tabla paginada de usuarios (`GET /users?page&limit`)
- [ ] Columnas: ID, username, email, rol, isBanned, fecha de registro
- [ ] Badge de rol y estado (baneado/activo)
- [ ] Drawer de detalle con historial de órdenes del usuario (`GET /users/:id` + `GET /orders/user/:userId`)
- [ ] Botón banear/desbanear (`PUT /users/:id/ban`) — solo owner, bloqueado en admin_demo
- [ ] Skeleton mientras carga

**Agregar ruta en `App.tsx`:**
```tsx
<Route path="users" element={<AdminUsersPage />} />
```

---

### 3. Página `/profile` — Perfil del cliente

**Archivos a crear:**
- `frontend/src/pages/Profile/index.tsx`
- `frontend/src/pages/Profile/ProfileInfo.tsx` (datos del usuario)
- `frontend/src/pages/Profile/OrderHistory.tsx` (historial de órdenes)
- `frontend/src/pages/Profile/OrderCard.tsx` (card por orden)
- `frontend/src/hooks/useMyOrders.ts`

**Funcionalidad:**
- [ ] Datos del usuario desde `AuthContext` (username, email, rol)
- [ ] Historial de órdenes paginado (`GET /orders/my?page&limit`)
- [ ] Cada orden muestra: ID, fecha, total, status con badge, lista de productos
- [ ] Acceso protegido — cualquier usuario autenticado (rol `cliente`, `admin_demo`, `owner`)
- [ ] Skeleton mientras carga el historial

**Agregar ruta en `App.tsx`:**
```tsx
// Dentro del ProtectedRoute con allowedRoles=[CLIENTE, ADMIN_DEMO, OWNER]
// o simplemente dentro de MainLayout con requireAuth
<Route path="/profile" element={<ProfilePage />} />
```

---

### 4. Navegación del sidebar admin

**Archivo a modificar:** `frontend/src/pages/admin/AdminLayout/AdminSidebar.tsx`

- [ ] Verificar que el sidebar tiene links a `/admin`, `/admin/products`, `/admin/orders`, `/admin/users`
- [ ] Agregar links faltantes si no existen

---

### 5. Link a perfil en Navbar

**Archivo a modificar:** `frontend/src/components/Navbar/UserDropdown.tsx`

- [ ] Verificar que el dropdown del usuario tiene link a `/profile`
- [ ] Agregar el link si no existe

---

## Notas de implementación

- Todos los hooks admin deben usar TanStack Query (`useQuery` / `useMutation`)
- Respetar `demoBlock`: los botones de ban y cambio de status mostrar tooltip o deshabilitarse visualmente para `admin_demo`
- Usar el tipo `Order`, `PaginatedOrders` de `src/types/order.ts` (ya existe)
- El tipo `User` está en `src/types/auth.ts` — verificar si tiene todos los campos necesarios (isBanned, createdAt)
- `order.service.ts` y `user.service.ts` ya existen — verificar que tienen las funciones necesarias antes de crear nuevas
- Skeletons obligatorios para cada sección que carga datos
