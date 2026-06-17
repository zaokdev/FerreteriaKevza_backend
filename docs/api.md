# Ferretería Kevza — API Reference

Base URL: `http://localhost:3000/api`

**Acceso**
- `pub` — público, sin sesión
- `auth` — sesión activa requerida
- `admin` — rol `owner` o `admin_demo`
- `owner` — solo rol `owner`
- `stripe` — llamado por Stripe, no por el cliente

---

## Auth `/auth`

| Método | Ruta            | Acceso | Body |
|--------|-----------------|--------|------|
| POST   | `/auth/register`         | pub  | `{ username, email, password }` |
| POST   | `/auth/login`            | pub  | `{ email, password }` |
| POST   | `/auth/logout`           | auth | — |
| GET    | `/auth/me`               | auth | — |
| POST   | `/auth/forgot-password`  | pub  | `{ email }` — siempre responde 200 |
| POST   | `/auth/reset-password`   | pub  | `{ token, password }` |

---

## Categorías `/categories`

| Método | Ruta                | Acceso | Body / Params |
|--------|---------------------|--------|---------------|
| GET    | `/categories`       | pub    | — |
| POST   | `/categories`       | owner  | `{ name }` |
| PUT    | `/categories/:id`   | owner  | `{ name }` |
| DELETE | `/categories/:id`   | owner  | — |

---

## Productos `/products`

| Método | Ruta                      | Acceso       | Body / Query |
|--------|---------------------------|--------------|--------------|
| GET    | `/products`               | pub          | `?page&limit` |
| GET    | `/products/featured`      | pub          | — |
| GET    | `/products/search`        | pub          | `?name&category&minPrice&maxPrice&inStock&page&limit` |
| GET    | `/products/:id`           | pub          | — |
| POST   | `/products`               | owner        | `{ name, stock, precio, idCategory, isFeatured?, images? }` |
| PUT    | `/products/:id`           | admin        | `{ name?, stock?, precio?, idCategory?, isFeatured?, isActive? }` |
| PUT    | `/products/:id/toggle`          | owner        | — |
| PUT    | `/products/:id/featured`        | owner        | `{ isFeatured }` |
| DELETE | `/products/:id`                 | owner        | — |
| POST   | `/products/:id/images`          | owner        | `multipart/form-data` campo `images` (max 10, JPG/PNG/WebP, 5 MB c/u) |
| DELETE | `/products/:id/images/:imageId` | owner        | — |

**Respuesta paginada** (`GET /products`, `/products/search`):
```json
{
  "data": [...],
  "total": 80,
  "page": 1,
  "limit": 20,
  "totalPages": 4
}
```

---

## Carrito `/cart`

Todos los endpoints requieren sesión activa (`auth`).

| Método | Ruta                      | Body / Params |
|--------|---------------------------|---------------|
| GET    | `/cart`                   | — |
| POST   | `/cart/items`             | `{ productId, quantity }` |
| PUT    | `/cart/items/:productId`  | `{ quantity }` — si `quantity = 0` elimina el item |
| DELETE | `/cart/items/:productId`  | — |
| DELETE | `/cart`                   | — |

**Respuesta GET `/cart`**:
```json
{
  "cart": {
    "items": [
      {
        "productId": 1,
        "name": "Martillo 16 oz",
        "precio": "189.00",
        "stock": 50,
        "quantity": 2,
        "subtotal": 378,
        "imagePath": "herramientas/martillo.jpg"
      }
    ],
    "total": 378
  }
}
```

---

## Checkout

| Método | Ruta                  | Acceso | Descripción |
|--------|-----------------------|--------|-------------|
| POST   | `/checkout`           | auth   | Crea sesión de Stripe, devuelve `{ url }` |
| GET    | `/checkout/success`   | auth   | Confirmación post-pago |
| GET    | `/checkout/cancel`    | auth   | Cancelación post-pago |
| POST   | `/webhook/stripe`     | stripe | Maneja `checkout.session.completed` y `checkout.session.expired` |

> El webhook está en `/webhook/stripe`, **no** en `/api/webhook/stripe`.

---

## Órdenes `/orders`

| Método | Ruta                     | Acceso | Body / Query |
|--------|--------------------------|--------|--------------|
| GET    | `/orders`                | admin  | `?page&limit` |
| GET    | `/orders/my`             | auth   | `?page&limit` |
| GET    | `/orders/:id`            | admin  | — |
| GET    | `/orders/user/:userId`   | admin  | `?page&limit` |
| PUT    | `/orders/:id/status`     | owner  | `{ status }` |

**Valores válidos de `status`:** `pendiente` · `cancelado` · `enviado` · `entregado`

---

## Usuarios `/users`

| Método | Ruta              | Acceso | Body / Query |
|--------|-------------------|--------|--------------|
| GET    | `/users`          | admin  | `?page&limit` |
| GET    | `/users/:id`      | admin  | — |
| PUT    | `/users/:id/ban`  | owner  | `{ isBanned: true/false }` |

---

## Health

| Método | Ruta          | Respuesta |
|--------|---------------|-----------|
| GET    | `/api/health` | `{ "status": "ok" }` |

---

## Notas generales

- Todas las respuestas de error siguen el formato `{ "message": "..." }`
- Las sesiones se manejan con cookies HttpOnly — el cliente no necesita manejar tokens
- `imagePath` siempre es una ruta relativa, nunca la URL completa
- Los precios están en **MXN**
