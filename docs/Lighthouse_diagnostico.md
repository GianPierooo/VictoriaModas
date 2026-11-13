# Diagnóstico Lighthouse — Victoria Modas

Actividad: diagnóstico primario de todas las vistas, backlog de fallas, eliminación o
mitigación y diagnóstico final. Herramienta: Google Lighthouse 13.6, modo **Desktop**
("Analyze page load"), el mismo que trae Chrome DevTools (F12 → Lighthouse).

Se evaluaron las **18 vistas públicas** de la tienda. El panel administrativo (`/admin/*`)
queda fuera porque exige sesión de administrador o vendedor; Lighthouse sin sesión solo
vería la redirección al login.

---

## 1. Diagnóstico primario (producción, https://www.victoriamodas.online, 12/11/2026)

| Vista | Ruta | Performance | Accesibilidad | Buenas prácticas | SEO | LCP |
|---|---|---|---|---|---|---|
| Inicio | `/` | 95 | 100 | 77 | 100 | 0.5 s |
| Vestidos | `/vestidos` | 95 | 95 | 100 | 100 | 1.5 s |
| Blusas | `/blusas` | 96 | 95 | 100 | 100 | 1.3 s |
| Pantalones | `/pantalones` | 97 | 95 | 100 | 100 | 1.3 s |
| Abrigos | `/abrigos` | 87 | 100 | 77 | 100 | 1.9 s |
| Detalle de producto | `/producto/blusa-seda-francesa` | 95 | 100 | 77 | 100 | 0.3 s |
| Carrito | `/carrito` | 91 | 100 | 77 | 100 | 1.3 s |
| Checkout | `/checkout` | 91 | 100 | 77 | 100 | 1.4 s |
| Favoritos | `/favoritos` | 90 | 100 | 77 | 100 | 1.3 s |
| Mi cuenta | `/mi-cuenta` | 96 | 100 | 77 | 100 | 1.4 s |
| Nosotros | `/nosotros` | 87 | 100 | 77 | 100 | 1.9 s |
| Contacto | `/contacto` | 92 | 100 | 77 | 100 | 1.3 s |
| Preguntas frecuentes | `/preguntas-frecuentes` | 86 | 100 | 77 | 100 | 1.9 s |
| Términos y condiciones | `/terminos-y-condiciones` | 91 | 100 | 77 | 100 | 1.3 s |
| Política de cambios | `/politica-de-cambios` | 91 | 100 | 77 | 100 | 1.3 s |
| Libro de reclamaciones | `/libro-de-reclamaciones` | 91 | 100 | 77 | 100 | 1.4 s |
| Mayoristas | `/mayoristas` | 86 | 100 | 77 | 66 | 1.9 s |
| Página 404 | `/no-existe` | 87 | 100 | 77 | 100 | 1.9 s |
| **Promedio** | | **91.3** | **99.2** | **80.8** | **98.1** | |

### Fallas detectadas

| Falla (auditoría Lighthouse) | Criterio | Vistas afectadas |
|---|---|---|
| Usa cookies de terceros (*third-party-cookies*) y avisos en el panel *Issues* | Buenas prácticas | 15 vistas |
| El popup de bienvenida aparece a los 2,2 s y pasa a ser el elemento LCP | Performance | Abrigos, FAQ, Mayoristas, 404 (LCP 1,9 s) |
| La animación de aparición oculta contenido ya visible (LCP retrasado 1,4 s) | Performance | Nosotros |
| Las primeras fotos del catálogo cargan en diferido (`loading="lazy"`) | Performance | Vestidos, Blusas, Pantalones |
| JavaScript sin usar (147–219 KiB por vista) | Performance | 18 vistas |
| Contraste insuficiente: "Hecho en Perú" del footer (3,5:1, mínimo 4,5:1) | Accesibilidad | Vestidos, Blusas, Pantalones |
| Encabezados fuera de orden: h1 → h3 en las tarjetas de producto | Accesibilidad | Vestidos, Blusas, Pantalones |
| Faltan *source maps* del JavaScript propio | Buenas prácticas | 18 vistas |
| Página bloqueada para indexación (`noindex`) | SEO | Mayoristas |

---

## 2. Backlog de tareas

Prioridad según el impacto en el puntaje y el número de vistas afectadas. Todas
pertenecen al Sprint 4 (QA, ajustes y despliegue), apoyando RNF-01 (rendimiento),
RNF-02 (seguridad y buenas prácticas) y RNF-03 (usabilidad y accesibilidad).

| ID | Tarea | Criterio | RNF | Prioridad | Estado |
|---|---|---|---|---|---|
| LH-01 | Cargar el píxel de Meta recién con la primera interacción (o a los 10 s), no durante la carga inicial | Buenas prácticas / Performance | RNF-01, RNF-02 | Alta | Mitigada |
| LH-02 | Mostrar el popup de bienvenida solo después de la primera interacción | Performance (LCP) | RNF-01, RNF-03 | Alta | Eliminada |
| LH-03 | Mostrar sin animación el contenido que ya está en pantalla al cargar | Performance (LCP) | RNF-01 | Alta | Eliminada |
| LH-04 | Cargar con prioridad alta las fotos de la primera fila del catálogo | Performance (LCP) | RNF-01 | Media | Eliminada |
| LH-05 | Sacar EmailJS del paquete común (solo lo usa Contacto) | Performance | RNF-01 | Media | Mitigada |
| LH-06 | Subir el contraste del texto "Hecho en Perú" del footer | Accesibilidad | RNF-03 | Media | Eliminada |
| LH-07 | Agregar un h2 para lectores de pantalla antes de la grilla de productos | Accesibilidad | RNF-03 | Media | Eliminada |
| LH-08 | Publicar *source maps* en el build de producción | Buenas prácticas | RNF-05 | Baja | Eliminada |
| LH-09 | Títulos del footer: de h3 a h2 (falla que apareció en el re-diagnóstico) | Accesibilidad | RNF-03 | Media | Eliminada |
| LH-10 | Contraste del texto de reemplazo de la foto del taller en Nosotros (1,8:1) | Accesibilidad | RNF-03 | Media | Eliminada |
| LH-11 | Área táctil de los puntos del carrusel de inicio: de 8 px a 24 px | Accesibilidad | RNF-03 | Media | Eliminada |
| LH-12 | `noindex` en Mayoristas | SEO | — | — | No se corrige (decisión de negocio) |

> LH-09 a LH-11 aparecieron en la primera medición después de corregir: antes el popup
> y la animación tapaban esos elementos y Lighthouse no los evaluaba.

---

## 3. Eliminación o mitigación (qué se hizo y dónde)

| ID | Cambio | Archivo |
|---|---|---|
| LH-01 | El script de Meta (~240 KB, cookies de terceros) se inyecta con el primer `scroll`, toque, clic o tecla, o a los 10 s. Los eventos se encolan antes, así que no se pierde ninguno. | `src/lib/metaPixel.js` |
| LH-02 | El temporizador del popup arranca con la primera interacción. Además deja de interrumpir a quien recién entra. | `src/components/WelcomePopup.jsx` |
| LH-03 | El hook de animación detecta lo que ya está en pantalla antes del primer pintado y lo muestra sin fundido. | `src/motion/useInViewReveal.js` |
| LH-04 | Las 4 primeras tarjetas usan `loading="eager"` y `fetchpriority="high"`. | `src/components/ProductCard.jsx`, `ProductsPage.jsx`, `FavoritesPage.jsx` |
| LH-05 | `@emailjs` queda fuera del chunk `vendor`. | `vite.config.js` |
| LH-06 | `text-cream/40` → `text-cream/60`. | `src/components/Footer.jsx` |
| LH-07 | `<h2 class="sr-only">` antes de la grilla. | `ProductsPage.jsx`, `FavoritesPage.jsx` |
| LH-08 | `build.sourcemap: true`. | `vite.config.js` |
| LH-09 | `<h3>` → `<h2>` en las tres columnas del footer. | `src/components/Footer.jsx` |
| LH-10 | `text-ink/30` → `text-ink-muted`; `text-clay/40` → `text-clay`. | `src/pages/AboutPage.jsx` |
| LH-11 | El botón mide 24×24 px; el punto visible sigue siendo de 8 px. | `src/components/HeroCarrusel.jsx` |

`npm run lint` y `npm run build` pasan sin errores.

---

## 4. Diagnóstico final

Medición en el **mismo equipo y en las mismas condiciones** con el build de producción
servido localmente (`vite preview`): primero el código sin las correcciones y luego con
ellas. Así la comparación no depende de la red ni del servidor.

| Vista | Performance | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Inicio | 98 → **100** | 100 → 100 | 100 → 100 | 100 → 100 |
| Vestidos | 97 → **98** | 95 → **100** | 100 → 100 | 100 → 100 |
| Blusas | 98 → **99** | 95 → **100** | 100 → 100 | 100 → 100 |
| Pantalones | 98 → **99** | 95 → **100** | 100 → 100 | 100 → 100 |
| Abrigos | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Detalle de producto | 97 → **100** | 100 → 100 | 96 → 96 | 100 → 100 |
| Carrito | 94 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Checkout | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Favoritos | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Mi cuenta | 93 → **98** | 100 → 100 | 100 → 100 | 100 → 100 |
| Nosotros | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Contacto | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Preguntas frecuentes | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Términos y condiciones | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Política de cambios | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Libro de reclamaciones | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| Mayoristas | 95 → **99** | 100 → 100 | 100 → 100 | 66 → 66 |
| Página 404 | 95 → **99** | 100 → 100 | 100 → 100 | 100 → 100 |
| **Promedio** | **95,6 → 99,0** | **99,2 → 100** | 99,8 → 99,8 | 98,1 → 98,1 |

LCP de las vistas más lentas: de 1,1 s a 0,9 s en local; en producción partían de 1,9 s.

**Pendiente:** medir de nuevo en producción (https://www.victoriamodas.online) después
del despliegue, con capturas de DevTools. Ahí se debe ver la mejora de Buenas prácticas
(77 → 100), porque la cookie de terceros del píxel de Meta solo se reproduce con el ID
real del píxel en el dominio publicado.

### Fallas que quedan y por qué

| Falla | Vista | Justificación |
|---|---|---|
| SEO 66: `noindex` | Mayoristas | A propósito: es una página privada con precios por mayor que no debe aparecer en Google. |
| JavaScript sin usar (~120 KiB) | Todas | Es código de React y Supabase que la app necesita para sesión y carrito en cualquier vista. Separarlo exigiría reescribir la carga de autenticación; no afecta el puntaje (Performance 98–100). |
| Errores en consola (Buenas prácticas 96) | Detalle de producto | Solo en la medición local: `/api/meta-conversions` es una función de Vercel que no existe en `vite preview`. En producción sí responde. |
| *bf-cache* bloqueado | Mi cuenta | El iframe de Cloudflare Turnstile (captcha del login) impide la caché atrás/adelante. Es un control de seguridad necesario. |

---

## 5. Cómo repetir la medición (para las capturas)

1. Abrir la vista en Google Chrome, en una ventana de incógnito (sin extensiones).
2. F12 → pestaña **Lighthouse**.
3. Modo *Navigation*, dispositivo **Desktop**, las 4 categorías marcadas.
4. **Analyze page load** y esperar.
5. Capturar el resumen de los 4 círculos. Para el "antes" sirven los números de la
   sección 1. Para el "después", las capturas se toman en producción una vez publicado
   el cambio.

Nota: Lighthouse varía unos puntos entre corridas (red, CPU). Conviene medir dos veces y
quedarse con la mediana.
