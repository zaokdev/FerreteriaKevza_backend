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

