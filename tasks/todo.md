# Tareas pendientes — Ferretería Kevza

> Última actualización: 2026-06-23
> Backend: 100% completo. Frontend: ~85% completo.

---

## Estado general

| Área                                                             | Estado       |
| ---------------------------------------------------------------- | ------------ |
| Backend (API, rutas, DB, Redis, Stripe, email)                   | ✅ Completo  |
| Backend — rate limiting                                          | ✅ Completo  |
| Frontend — tienda del cliente                                    | ✅ Completo  |
| Frontend — auth (login, register, verify, forgot/reset password) | ✅ Completo  |
| Frontend — admin dashboard                                       | ✅ Completo  |
| Frontend — admin productos                                       | ✅ Completo  |
| Frontend — perfil de usuario                                     | ✅ Completo  |
| Frontend — admin órdenes                                         | ❌ Pendiente |
| Frontend — admin usuarios                                        | ❌ Pendiente |

---

## Pendientes

### 1. Página `/admin/orders` — Gestión de órdenes

**Archivos a crear:**

- `frontend/src/pages/admin/Orders/index.tsx`
- `frontend/src/pages/admin/Orders/components/AdminOrdersTable.tsx` (tabla paginada)
- `frontend/src/pages/admin/Orders/components/OrderDetailDrawer.tsx` (detalle + cambio de estado)
- `frontend/src/hooks/useAdminOrders.ts`
- `frontend/src/hooks/useUpdateOrderStatus.ts`

**Servicios — agregar a `order.service.ts`:**

- `getOrderById(id: number)` → `GET /orders/:id`
- `updateOrderStatus(id, status)` → `PUT /orders/:id/status`

**Funcionalidad:**

- [ ] Tabla paginada de órdenes (`GET /orders?page&limit`)
- [ ] Columnas: ID, cliente, total, status, fecha
- [ ] Badge de color por status (reutilizar componente y `STATUS_STYLES` existente)
- [ ] Drawer de detalle al hacer clic en una fila REUTILIZAR COMPONENTE (`GET /orders/:id`)
- [ ] Selector de status dentro del drawer (`PUT /orders/:id/status`) — solo owner, deshabilitado en admin_demo
- [ ] Skeleton mientras carga

**Agregar ruta en `App.tsx`:**

```tsx
<Route path="orders" element={<AdminOrdersPage />} />
```

---

### 2. Página `/admin/users` — Gestión de usuarios

**Archivos a crear:**

- `frontend/src/pages/admin/Users/index.tsx`
- `frontend/src/pages/admin/Users/components/UsersTable.tsx` (tabla paginada)
- `frontend/src/pages/admin/Users/components/UserDetailDrawer.tsx` (detalle + historial + ban)
- `frontend/src/hooks/useAdminUsers.ts`
- `frontend/src/hooks/useBanUser.ts`

**Servicios — crear `user.service.ts`:**

```ts
- getUsers(params?) → GET /users
- getUserById(id) → GET /users/:id
- banUser(id, isBanned) → PUT /users/:id/ban
```

**Funcionalidad:**

- [ ] Tabla paginada de usuarios (`GET /users?page&limit`)
- [ ] Columnas: ID, username, email, rol, estado (activo/baneado), fecha de registro
- [ ] Badge de rol y badge de estado
- [ ] Drawer de detalle con órdenes del usuario (`GET /users/:id` + `GET /orders/user/:userId`)
- [ ] Botón banear/desbanear (`PUT /users/:id/ban`) — solo owner, deshabilitado en admin_demo
- [ ] Skeleton mientras carga

**Agregar ruta en `App.tsx`:**

```tsx
<Route path="users" element={<AdminUsersPage />} />
```

---

### 3. Navegación del panel admin

**Archivo a verificar:** `frontend/src/pages/admin/AdminLayout/components/AdminSidebar.tsx`

- [ ] Confirmar que tiene links a `/admin/orders` y `/admin/users`
- [ ] Agregar links faltantes si no existen

---

## Notas de implementación

- `ORDER_STATUSES`, `STATUS_STYLES`, `STATUS_LABELS` ya existen en el codebase — no duplicar, reutilizar desde `@/types/order` y patron del componente Dashboard
- Tipos `Order`, `PaginatedOrders`, `OrderUser` ya definidos en `src/types/order.ts`
- El tipo `User` en `src/types/auth.ts` NO tiene `isBanned` ni `createdAt` — verificar con backend y extender el tipo si el endpoint `/users` los devuelve
- Skeletons obligatorios para cada sección que carga datos (patrón: `animate-pulse` sobre `bg-surface`)
- Los drawers usan el componente `Sheet` de shadcn/ui (ya instalado)
- `demoBlock`: desactivar visualmente botones bloqueados para admin_demo con `disabled` + tooltip opcional
