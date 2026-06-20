# Tareas pendientes — Ferretería Kevza

> Última actualización: 2026-06-20
> Backend: 100% completo. Frontend: ~70% completo.

---

## Estado general

| Área | Estado |
|------|--------|
| Backend (API, rutas, DB, Redis, Stripe, email) | ✅ Completo |
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
