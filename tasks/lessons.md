# Lecciones aprendidas

## Upstash `hgetall` con `automaticDeserialization: false` devuelve array plano, no objeto

**Síntoma:** el carrito mostraba siempre los productos de id 1, 2, 3 (los primeros de la DB) con
cantidades basura, sin importar qué se agregara. La escritura en Redis era correcta
(`HGETALL carrito:4 → 80, 6, 56, 3` = `{ "80":6, "56":3 }`), pero `GET /cart` devolvía productId
1/2/3 con cantidades 6/56/3.

**Causa:** con `automaticDeserialization: false`, el cliente `@upstash/redis` devuelve `hgetall`
como **array plano** `["80","6","56","3"]`, no como objeto `{ "80":"6", "56":"3" }`. El servicio lo
trataba como objeto: `Object.keys(array)` da los **índices** `[0,1,2,3]` (usados como productIds →
siempre los primeros productos) y `array[product.id]` lee valores por **posición** (cantidades
basura). Lectura silenciosamente corrupta — nunca lanza error.

**Regla:** toda abstracción sobre `hgetall` debe normalizar el array plano a `{ campo: valor }`
antes de devolverlo. El fix vive en `config/redis.js` (`hash.getAll`), no en los consumidores.

**Por qué importa:** además del carrito, `checkout.service.js` también lee `getCart()` → el bug
habría cobrado productos y cantidades equivocados en Stripe.

**Método que lo resolvió:** no se pudo encontrar leyendo código (todas las capas se veían
correctas). Se resolvió pidiendo al usuario observación de runtime: `HGETALL` crudo vs. respuesta
de `GET /cart` lado a lado. El patrón "índices del array como ids, valores por posición como
cantidades" lo delató. Lección: cuando el código se ve correcto pero el dato sale mal, observar el
shape real del dato en runtime antes de seguir teorizando.

## El frontend se adapta al backend, no al revés

**Síntoma:** al construir `/admin/orders` se detectó que el backend devuelve `orderDetails`
(`{ id, quantity, unitPrice, product:{id,name} }`) pero el tipo `Order.items` del frontend nunca se
poblaba — `OrderCard` (Profile) caía siempre en `order.items ?? []` y no renderizaba productos.

**Reacción inicial (incorrecta):** agregar un presenter/mapeo en el backend (`orderDetails → items`)
para que la API encajara con el tipo del frontend. El usuario lo rechazó: *"el frontend se tiene que
acoplar al backend, esa no es la manera ideal"*.

**Regla:** el backend expone su modelo de dominio (espejo de la tabla `order_details`). No se
remodela la respuesta del backend para satisfacer un tipo del frontend; **el frontend conforma su
tipo a la forma real de la API**. Confirmado por precedente ya en el código: `checkout.service.ts` y
`CheckoutSuccess` ya consumían `orderDetails` directamente. El fix correcto fue alinear
`types/order.ts` a `orderDetails` y leerlo en los consumidores (arregló de paso el bug de Profile).

**Por qué importa:** mapear en el backend para encajar con el front invierte la dirección del
contrato, duplica formas para la misma entidad y esconde el modelo real. Antes de "arreglar" una
discrepancia de shape, preguntar qué lado es la fuente de verdad — casi siempre es el backend.

## Antes de introducir una carpeta/capa nueva en el backend, revisar la estructura existente

Al mapear órdenes propuse `backend/src/presenters/` — capa que **no existe** en el proyecto
(`controllers → services → repositories`, helpers transversales en `utils/`). El usuario lo cuestionó.
**Regla:** la lógica de forma de respuesta vive en el `service` (donde ya se arma `paginatedResponse`)
o en `utils/` si es transversal; no se inventan capas nuevas sin preguntar. Cambios mínimos.

