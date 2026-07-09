# CLAUDE.md — Victoria Modas

Contexto persistente para Claude Code. Léelo al iniciar cada sesión antes de tocar nada.

## Qué es el proyecto
E-commerce de moda femenina (Gamarra, Lima). **Web viva en https://victoriamodas.store**,
desplegada en Vercel con auto-deploy en cada push a `main`. Dominio ya conectado.
Modelo de venta: catálogo → pedido por **WhatsApp** (+51 993 357 672). Sin pasarela de
pago por ahora.

## Stack exacto (no asumir otras versiones)
- React **19.1.1** + Vite **7.1.7**, proyecto ESM (`"type": "module"`).
- react-router-dom **6.30.1** — SPA con `createBrowserRouter`, todas las páginas con
  `React.lazy()` + `<Suspense>`.
- Tailwind CSS **3.4.18** — TODO el estilado (sin CSS externo salvo `index.css`).
- @headlessui/react 2.2.9, @heroicons/react 2.2.0, @emailjs/browser 4.4.1.
- sharp (devDep) para WebP vía `npm run optimize-images`.
- SIN TypeScript, SIN tests, SIN framer-motion, SIN backend (hasta ahora).
- Scripts: `dev`, `build`, `lint` (eslint), `preview`, `optimize-images`.

## Dos segmentos de cliente (CRÍTICO)
- **Vitrina pública** (web + redes sociales) = SOLO precios **al por menor**.
- **Mayoreo** = privado, para clientas que ya conocen el negocio, por enlace/canal
  directo (WhatsApp).
- **NUNCA** exponer precios de mayoreo (`precioMayorPEN`) en superficies públicas ni
  enviarlos al cliente (navegador). El dueño tiene RUC → puede facturar y cobrar formal.

## Paleta (no cambiar sin avisar)
- cream `#FBF7F4` / cream-dark `#F4EDE7`
- ink `#2B2424` / soft `#5B5150` / muted `#756967`
- clay `#9C5F4E` / dark `#8A5340` / light `#D7B3A8`
- rose `#E8B4B8`
- Tipografía: Bodoni Moda (serif, títulos) + Roboto Flex (texto). `tracking-luxe` 0.28em.
- Estética boutique premium. NUNCA: neón, glow, sombras de color, rebotes, rotaciones,
  gradientes saturados, círculos con blur.

## Modelo de datos
- **Productos:** fuente única en `src/data/products.js` (array `PRODUCTS`, 6 productos).
  Campos por producto: `id, name, description, badge, category, fabric, image, images[],
  sizes[], colors[], colorImages{}`. **No contiene precios ni stock.**
  Helpers: `getProductById`, `getProductsByCategory`, `searchProducts`.
- **Stock y precios (fuente externa):** una hoja (Excel en OneDrive vía Microsoft Graph,
  o Google Sheet). Hoja `Stock` con columnas:
  `id, nombre, color, talla, stock, canal, precioMenorPEN, precioMayorPEN,
  precioMenorUSD, activo`  (`canal` = menor/mayor/ambos).
  **Clave de unión con products.js:** `id + color + talla`.
- **Pedidos:** hoja `Pedidos` (la escribe la API): `fecha, canal, cliente, telefono,
  items, total, estado`.

## Arquitectura de automatización (a construir)
Funciones serverless en **`/api`** (mismo repo, mismo dominio, mismo deploy):
- `/api/stock.js` — lee la hoja de stock y devuelve por prenda/color/talla
  `{ id, color, talla, stock, estado }` con estado `disponible` (>3) / `ultimas` (1–3) /
  `agotado` (0). Toda la lectura va detrás de una sola función `readStock()` para poder
  cambiar la fuente (Graph ↔ Sheets) sin tocar el resto. Con **fallback**: si faltan las
  variables de entorno, no revienta; devuelve estado `consultar`.
- `/api/pedido.js` — recibe un pedido y agrega una fila a la hoja `Pedidos`.
- `/api/chat.js` — (fase posterior) bot con Claude (`ANTHROPIC_API_KEY` en env),
  ACOTADO a tareas de negocio (no chat abierto), con productos + FAQ + stock como
  contexto, que siempre deriva a WhatsApp para cerrar.

## ⚠️ vercel.json (archivo delicado)
Estado actual:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }], "headers": [ ... ] }
```
Ese catch-all se tragaría `/api`. Al añadir funciones, cambiar SOLO el `source` del
rewrite a:  `"/((?!api/).*)"`  (excluye el prefijo `api/`). No tocar nada más de este
archivo. Sin este cambio, las llamadas a la API devuelven el HTML del SPA.

## Reglas de trabajo (obligatorias)
1. Claves y secretos **SOLO** en variables de entorno de Vercel. NUNCA en el cliente.
2. `npm run build` y `npm run lint` sin errores **antes de cada commit**.
3. Commits descriptivos e intermedios (para poder revertir).
4. `vercel.json`: solo el cambio de `/api` de arriba.
5. Fuente única de productos: `src/data/products.js`. No duplicar datos.
6. Siempre responsive (probar 375 / 768 / 1280). La mayoría de clientas usan celular.
7. Precios de mayoreo nunca llegan al navegador.

## Estado actual del repo (julio 2026)
- Web completa y en producción (home, catálogo, producto, carrito, checkout, favoritos,
  páginas de contenido, header, footer). Build y lint limpios.
- **Pendiente de integrar:** `ChatWidget.jsx` (asistente on-site ya diseñado, con
  estilos en línea en la paleta, posicionado abajo-izquierda para no chocar con el botón
  flotante de WhatsApp del Footer). Aún NO está en el repo: la primera sesión debe
  agregarlo y luego conectarlo al stock.
- No existe `/api` todavía.

## Plan por fases
0. Catálogo completo (MANUAL, lo llena el dueño en la hoja de stock).
1. Stock en vivo (`/api/stock` + indicador en web y ChatWidget).
2. Pedidos → hoja `Pedidos` (`/api/pedido`).
3. Segmentación menor (público) / mayor (privado).
4. Bot con IA (`/api/chat`) + vía WhatsApp API (WhatsApp Business Platform, con
   verificación de Meta y plantillas — trámite externo con demora).
5. Crecimiento internacional (USD, inglés, envío internacional).
