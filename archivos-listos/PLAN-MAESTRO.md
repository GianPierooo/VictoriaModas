# 🌸 PLAN MAESTRO — Rediseño VictoriaModas
### De web amateur a tienda de moda profesional · victoriamodas.store

> **Cómo usar este documento:** Cada fase tiene prompts listos para copiar y pegar en Claude Code, en orden. No saltes fases: el orden importa (primero el sistema de diseño, luego las páginas, luego datos, luego deploy). Ejecuta un prompt, revisa el resultado en `npm run dev`, haz commit, y pasa al siguiente.

---

## 🎯 REFERENCIA DE DISEÑO: House of CB

Nuestra estrella guía es **House of CB** (houseofcb.com), la marca londinense líder mundial en moda femenina coqueta-premium. Es exactamente la sensación "femenino, cálido, rosa, suave, coqueto" pero ejecutada con disciplina de marca cara. Referencia secundaria: **Oh Polly** (ohpolly.com).

**Qué copiamos de House of CB (estructura y sensación, NUNCA contenido ni fotos):**

1. **Paleta contenida:** fondos crema/blanco cálido, rosa empolvado como acento (no rosa chicle saturado), texto en tinta oscura cálida. El rosa se usa en detalles, no en todo.
2. **Tipografía editorial:** serif elegante para títulos grandes, sans limpia para todo lo demás. Títulos en font-light, nunca en bold pesado.
3. **Las fotos mandan:** las imágenes de producto ocupan la mayor parte de la pantalla, sin marcos recargados ni badges gigantes. Cards de producto limpias: foto + nombre + nada más.
4. **Espacio en blanco generoso:** secciones con mucho aire (padding vertical de 80-120px), pocas cosas por pantalla.
5. **Microinteracciones sutiles:** hover con zoom lento de imagen (scale 1.05 en 1.2s), nunca rebotes, brillos de neón ni elementos flotantes.
6. **Navegación minimal:** menú en mayúsculas pequeñas con tracking amplio, header que se vuelve sólido al hacer scroll.
7. **Mobile primero:** más del 80% de las compradoras de moda navegan desde el celular.

**Lo que NO vamos a copiar:** sus fotos, sus textos, su logo, sus productos. Solo la arquitectura visual.

---

## 📋 DIAGNÓSTICO ACTUAL (auditado el 11-jun-2026)

**Lo bueno que ya tienes:**
- Stack moderno: React 19 + Vite 7 + Tailwind 3.4 + React Router 6
- Estructura de páginas completa y ordenada (12 rutas)
- Carrito funcional con persistencia en localStorage
- Flujo de pedido por WhatsApp operativo (+51 993357672)
- Tipografías bien elegidas (Bodoni Moda + Roboto Flex)
- 6 productos reales con fotos en varios colores

**Los problemas, por gravedad:**

| # | Problema | Gravedad | Fase que lo arregla |
|---|----------|----------|---------------------|
| 1 | Hero y 10+ imágenes dependen de Unsplash (fotos de stock que no son tu ropa) | 🔴 Crítico | Fase 2 |
| 2 | No existe `vercel.json` → todas las rutas darán 404 al desplegar | 🔴 Crítico | Fase 6 |
| 3 | Categoría Abrigos vacía (`products = []`) pero visible en menú | 🔴 Crítico | Fase 4 |
| 4 | Productos duplicados en 2 lugares (páginas de categoría + MOCK_PRODUCTS) | 🟠 Alto | Fase 4 |
| 5 | Diseño recargado: círculos flotantes con blur, sombras neón, badges circulares de 64px, gradientes por todos lados | 🟠 Alto | Fases 1-2 |
| 6 | Header con texto blanco ilegible sobre fondos claros | 🟠 Alto | Fase 1 |
| 7 | Logo es texto plano con emoji ✨ (tienes logo profesional sin usar) | 🟠 Alto | Fase 1 |
| 8 | Sin SEO: favicon de Vite, sin Open Graph completo, sin robots.txt, sin sitemap, títulos de página no cambian por ruta | 🟡 Medio | Fase 5 |
| 9 | Página "Mi Cuenta" decorativa (todos los links van a `#`) | 🟡 Medio | Fase 4 |
| 10 | Bundle de 519 KB sin code-splitting | 🟡 Medio | Fase 5 |
| 11 | `removeItem`/`updateQuantity` del carrito usan índice de array como ID (frágil) | 🟡 Medio | Fase 4 |
| 12 | Footer sin Instagram/TikTok (solo Facebook) | 🟢 Bajo | Fase 4 |
| 13 | Filtro de tela se pasa como prop pero nunca filtra | 🟢 Bajo | Fase 4 |

---

## ✅ ARCHIVOS YA REDISEÑADOS (carpeta `archivos-listos/`)

Estos 4 archivos ya fueron rediseñados y validados visualmente. **Úsalos en la Fase 1** — le ahorran trabajo a Claude Code:

- `tailwind.config.js` → Nueva paleta completa (crema, rosa empolvado, terracota, tinta cálida) + sombras suaves + tracking-luxe
- `Header.jsx` → Header legible con logo tipográfico elegante "Victoria*Modas*"
- `ProductCard.jsx` → Card editorial limpia estilo House of CB
- `Hero-nuevo.jsx` → Hero editorial de 2 columnas con producto real (para pegar dentro de HomePage.jsx)

---
---

# FASE 0 — PREPARACIÓN (15 min)

### Prompt 0.1 — Limpieza y rama de trabajo
```
Estamos en el proyecto VictoriaModas (React 19 + Vite + Tailwind). Antes de empezar un rediseño grande:

1. Crea una rama nueva llamada `redesign-2026` desde main y trabaja en ella.
2. Elimina archivos basura si existen: src/App.css (si no se importa en ningún lado), src/assets/react.svg, public/vite.svg.
3. Verifica que `npm run dev` y `npm run build` funcionan sin errores antes de tocar nada.
4. Crea un archivo NOTAS-REDISENO.md en la raíz donde iremos registrando cada cambio hecho.

No cambies nada más todavía.
```

### Prompt 0.2 — Actualizar README desactualizado
```
El README.md del proyecto está desactualizado: menciona CSS Modules, precios y un CatalogPage.jsx que ya no existen. Reescríbelo reflejando el estado real:
- Stack: React 19, Vite 7, Tailwind CSS 3.4, React Router DOM 6, Context API para carrito
- Modelo de negocio: catálogo sin precios públicos, pedidos se cierran por WhatsApp
- Estructura real de carpetas
- Comandos: npm install / npm run dev / npm run build
- Dominio de producción: victoriamodas.store (deploy en Vercel)
```

---

# FASE 1 — SISTEMA DE DISEÑO (la base de todo)

> **Objetivo:** Cambiar la identidad visual de "rosa saturado recargado" a "cálido premium estilo House of CB". Tengo 4 archivos ya rediseñados y validados — están en la carpeta `archivos-listos/` de este paquete.

### Prompt 1.1 — Nueva paleta (usar archivo listo)
```
Voy a reemplazar el sistema de color del proyecto. Te paso el contenido del nuevo tailwind.config.js [PEGA AQUÍ EL CONTENIDO DE archivos-listos/tailwind.config.js].

Reemplaza el tailwind.config.js actual con este. La nueva paleta es:
- cream (#FBF7F4 fondo, #F4EDE7 oscuro): fondos cálidos en vez de blanco frío
- rose empolvado (#E8B4B8 principal, escala 50-500): acento femenino NO saturado
- clay (#C08B7D): terracota para detalles y hovers
- ink (#2B2424, soft #5B5150, muted #8A7E7C): texto cálido en vez de negro/gris puros

Después del cambio, busca en TODO el proyecto las clases que ya no existen y rómpelas a propósito para detectarlas: las clases antiguas bg-rose-light, text-rose-dark etc. siguen existiendo pero con valores nuevos, así que el sitio no se romperá, solo cambiará de tono. Ejecuta npm run build para confirmar que compila.
```

### Prompt 1.2 — Header legible y elegante (usar archivo listo)
```
Reemplaza src/components/Header.jsx con esta versión rediseñada: [PEGA AQUÍ EL CONTENIDO DE archivos-listos/Header.jsx]

Los cambios clave que trae:
- El logo ahora es tipográfico elegante: "Victoria" en serif + "Modas" en itálica color clay (antes era texto con emoji ✨)
- Todo el texto del header usa color ink (oscuro) SIEMPRE — antes usaba texto blanco que era ilegible sobre fondos claros
- Menú en mayúsculas pequeñas con tracking amplio (text-xs uppercase tracking-[0.15em]) estilo boutique
- Al hacer scroll el header se vuelve bg-cream/90 con backdrop-blur

Verifica que el menú móvil (hamburguesa) también quedó legible y coherente con la nueva paleta. Si el menú móvil tiene fondos o textos de la paleta vieja (bg-rose/30, text-white sobre claro), corrígelos al mismo estilo: fondo cream, texto ink, acentos clay.
```

### Prompt 1.3 — ProductCard editorial (usar archivo listo)
```
Reemplaza src/components/ProductCard.jsx con esta versión: [PEGA AQUÍ EL CONTENIDO DE archivos-listos/ProductCard.jsx]

Estilo House of CB: la foto manda, info mínima debajo centrada, badge discreto tipo pill pequeño (no círculo gigante), CTA "Ver detalle" que aparece al hover sobre la imagen, zoom lento de 1.2s.

IMPORTANTE: La card vieja mostraba botones de tallas S/M/L que NO hacían nada (no agregaban al carrito). La nueva ya no los tiene — las tallas se eligen en la página de producto, como debe ser.

Busca si UnifiedProductCard.jsx o el CatalogProductCard dentro de ProductsPage.jsx se usan en el catálogo, y aplícales el MISMO estilo editorial para que las cards se vean idénticas en home y catálogo.
```

### Prompt 1.4 — Logo real e identidad
```
Tengo un logo profesional de Victoria Modas. Lo voy a colocar en public/logo/ (logo.png y logo-blanco.png si tengo versión clara).

1. En el Header, reemplaza el logo tipográfico por: <img src="/logo/logo.png" alt="Victoria Modas" /> con altura h-10 en desktop y h-8 en móvil. Si el logo no carga (onError), que haga fallback al logo tipográfico actual.
2. Usa el mismo logo en el Footer.
3. Genera el favicon: crea public/favicon.png a partir del logo (idealmente solo el isotipo/símbolo) y actualiza index.html para usarlo en vez de /vite.svg. Agrega también apple-touch-icon.
```

---

# FASE 2 — HOME PAGE COMPLETO

> **Objetivo:** El home es tu vitrina. Cada sección debe usar TUS productos, no fotos de stock, y respirar como House of CB.

### Prompt 2.1 — Hero editorial (usar archivo listo)
```
Reemplaza la función Hero() dentro de src/pages/HomePage.jsx con esta versión: [PEGA AQUÍ EL CONTENIDO DE archivos-listos/Hero-nuevo.jsx]

Qué hace el nuevo hero:
- Layout 2 columnas: izquierda texto editorial ("Elegancia / hecha para ti" con la segunda línea en itálica clay), derecha UNA foto de producto real grande con marco interior elegante
- Fondo cream con 2 acentos radiales rosa muy sutiles (sin blur-3xl, sin círculos flotantes animados)
- CTA principal: pill negra (bg-ink) que se vuelve clay al hover. CTA secundaria: pill outline
- Indicador "Descubre ↓" abajo
- CERO dependencia de Unsplash: usa /imagenes/vestidos/vestido_suplex01/azul_adelante.png

Elimina del archivo los imports que queden sin usar tras quitar el slider viejo (useRef, ChevronLeftIcon si ya no se usan).
```

### Prompt 2.2 — Sección Categorías con productos reales
```
En HomePage.jsx hay una sección CategoryShowcase que muestra 4 categorías (Vestidos, Pantalones, Conjuntos, Bodys) usando fotos de Unsplash. Cámbiala así:

1. Solo 3 categorías REALES: Vestidos, Blusas, Pantalones (elimina Conjuntos y Bodys que no existen, y NO incluyas Abrigos porque aún no hay productos).
2. Usa fotos de productos reales:
   - Vestidos → /imagenes/vestidos/vestido_lame01/negro_adelante.png
   - Blusas → /imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png
   - Pantalones → /imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_negro.png
3. Estilo: grid de 3 columnas (1 en móvil), cada categoría es una imagen aspect-[3/4] con overlay degradado oscuro sutil abajo y el nombre de la categoría en serif blanco encima, hover con zoom lento. Esquinas rounded-lg, no rounded-3xl.
4. Título de sección: eyebrow pequeña "Colecciones" en tracking-luxe clay + título serif grande "Encuentra tu estilo" en ink. Centrado, con padding vertical py-24.
```

### Prompt 2.3 — Limpiar las demás secciones del home
```
Revisa TODO HomePage.jsx sección por sección y aplica esta limpieza estilo House of CB:

1. ELIMINA todos los divs decorativos de círculos con blur (bg-rose/20 blur-3xl animate-float, animate-breathe, animate-pulse-soft etc.) en TODAS las secciones. El fondo debe ser cream o white plano, alternando entre secciones.
2. La sección FeaturedProducts ("Productos destacados") debe usar el ProductCard nuevo, grid de 3-4 columnas, con eyebrow + título serif como en 2.2.
3. La sección ProductSpotlight: mantenla pero con foto de producto real y sin gradientes de fondo.
4. La sección SocialFavorites: cámbiale las imágenes a productos reales. Quita el emoji 📸 del badge de Instagram y usa el ícono de heroicons CameraIcon o elimínalo.
5. La sección BlogNoticias usa 3 fotos de Unsplash: ELIMINA esta sección completa por ahora (no tenemos blog real; tener un blog falso resta credibilidad). La reactivaremos cuando haya contenido.
6. Las animaciones de scroll (useScrollAnimation con IntersectionObserver) MANTENLAS, están bien — solo asegúrate de que la animación sea fadeInUp sutil sin delays mayores a 400ms.
7. Espaciado: todas las secciones con py-20 md:py-28 mínimo. Que respire.

Al final ejecuta npm run build y confirma 0 errores y 0 referencias restantes a images.unsplash.com en HomePage.jsx (verifica con grep).
```

### Prompt 2.4 — Announcement banner y botón WhatsApp
```
1. En AnnouncementBanner.jsx: quita los emojis ✨ de los mensajes. Estilo nuevo: fondo ink (oscuro), texto cream en text-xs uppercase tracking-[0.2em]. Mensajes rotativos sobrios: "Envío gratis en compras mayores a S/ 200" · "Nueva colección disponible" · "Atención por WhatsApp".
2. El botón flotante de WhatsApp (verde, abajo a la derecha): mantenlo porque es el canal de venta, pero hazlo coherente: círculo de 56px, fondo #25D366, sombra soft, SIN animaciones de pulso exageradas. Tooltip al hover: "¿Tienes dudas? Escríbenos".
```

---

# FASE 3 — CATÁLOGO Y PÁGINA DE PRODUCTO

### Prompt 3.1 — Página de catálogo (ProductsPage.jsx)
```
Rediseña src/components/ProductsPage.jsx (el componente compartido de catálogo) al estilo House of CB:

1. Cabecera de categoría: fondo cream, eyebrow "Colección" + título serif grande font-light (ej. "Vestidos") + contador discreto "X piezas". Sin imágenes de fondo ni gradientes.
2. Las cards del catálogo (CatalogProductCard interno): usa EXACTAMENTE el mismo diseño que ProductCard.jsx de la Fase 1 (foto manda, info centrada debajo, hover con CTA).
3. Filtros: muévelos a una barra horizontal sticky bajo el header (no sidebar) en desktop: dropdowns minimal para Talla, Color, y toggle "Nuevo" / "Oferta". En móvil: botón "Filtrar" que abre un panel deslizante desde abajo (puedes usar Dialog de @headlessui que ya está instalado).
4. ARREGLA el bug del filtro de tela: availableFabrics se pasa como prop pero el filtrado por tela nunca se aplica. Implémentalo o elimina la prop, lo que sea más limpio.
5. Grid: 2 columnas en móvil, 3 en tablet, 4 en desktop, gap generoso (gap-x-6 gap-y-12).
6. Estado vacío elegante: si no hay productos tras filtrar, mensaje serif "No encontramos piezas con esos filtros" + botón para limpiar filtros.
```

### Prompt 3.2 — Página de producto (ProductPage.jsx)
```
Rediseña src/pages/ProductPage.jsx al estilo boutique premium:

1. Layout desktop: 60% izquierda galería / 40% derecha info sticky.
2. Galería: imagen principal grande aspect-[3/4] + thumbnails verticales al lado (o debajo en móvil). Al cambiar de color con colorImages, transición suave de opacidad. Soporta swipe en móvil.
3. Panel de info (derecha, sticky): categoría en eyebrow tracking-luxe → nombre en serif text-3xl font-light → descripción en ink-soft font-light → selector de color (círculos de 32px con el colorMap, borde clay en el activo, nombre del color visible) → selector de talla (pills rectangulares minimal, NO círculos) → selector de cantidad → botón principal "Agregar al carrito" pill bg-ink full-width que pasa a clay en hover → botón secundario "Consultar por WhatsApp" outline con ícono.
4. Debajo: acordeón minimal (border-top hairline) con: Detalles y tela / Envíos / Cambios y devoluciones. Usa Disclosure de @headlessui.
5. Sección "También te puede gustar" al final con 4 ProductCards de la misma categoría.
6. ELIMINA cualquier círculo decorativo con blur y sombras neón que tenga la página.
7. UNIFICA el colorMap: ahora está duplicado en ProductsPage.jsx y ProductPage.jsx. Extráelo a src/utils/colorMap.js y que ambos lo importen.
```

### Prompt 3.3 — Carrito y Checkout
```
Rediseña CartPage.jsx y CheckoutPage.jsx con la nueva identidad:

CARRITO:
1. Lista de items: foto pequeña rounded-lg + nombre serif + talla/color en ink-muted + selector cantidad + quitar (ícono X discreto).
2. ARREGLA el bug técnico: removeItem y updateQuantity usan el índice del array como itemId. Cambia a un ID estable compuesto: `${id}-${selectedColor}-${selectedSize}`. Actualiza CartContext.jsx en consecuencia sin romper la persistencia en localStorage (vm_cart_items).
3. Resumen lateral sticky: total de artículos + botón "Finalizar pedido" (bg-ink → clay hover) + nota "Coordinaremos pago y envío por WhatsApp".
4. Carrito vacío elegante: ilustración mínima o ícono, mensaje serif "Tu carrito está esperando", CTA a /vestidos.

CHECKOUT:
5. Mantén el flujo por WhatsApp pero pule el formulario: inputs con border-b hairline estilo editorial (sin cajas grises), labels flotantes o arriba en text-xs uppercase tracking, validación visual sutil en clay/rojo suave.
6. En el mensaje de WhatsApp generado, quita los emojis 👤📋 y usa texto limpio con asteriscos de negrita de WhatsApp.
7. Agrega un paso de confirmación visual: al enviar, mostrar pantalla "¡Pedido enviado! Te responderemos pronto por WhatsApp" con resumen.
```

---

# FASE 4 — PÁGINAS SECUNDARIAS Y DATOS

### Prompt 4.1 — Centralizar productos (LA mejora técnica más importante)
```
El proyecto tiene los productos duplicados en dos lugares que hay que mantener sincronizados a mano: los arrays en cada página de categoría (VestidosPage, BlusasPage, PantalonesPage) y el objeto MOCK_PRODUCTS en ProductPage.jsx. Esto es fuente de bugs.

Centralízalo:
1. Crea src/data/products.js que exporte un único array PRODUCTS con TODOS los productos (fusiona la info de ambas fuentes; si hay conflictos, gana la versión de MOCK_PRODUCTS que es más completa con colorImages).
2. Exporta helpers: getProductById(id), getProductsByCategory(category), searchProducts(query).
3. Refactoriza VestidosPage, BlusasPage, PantalonesPage, AbrigosPage, ProductPage y SearchModal para que TODOS consuman de src/data/products.js. Las páginas de categoría quedan de ~10 líneas cada una.
4. Verifica que el detalle de producto y el catálogo muestran exactamente lo mismo que antes (mismos 6 productos, mismas imágenes por color).

Esto prepara el terreno para migrar a un CMS o backend en el futuro sin reescribir componentes.
```

### Prompt 4.2 — Resolver Abrigos vacío
```
La página /abrigos existe en el menú pero su array de productos está vacío — un cliente que entre ve una categoría muerta.

1. Quita "ABRIGOS" del menú de navegación del Header (desktop y móvil) y de la sección de categorías del Footer.
2. NO borres AbrigosPage.jsx ni su ruta (la reactivaremos cuando haya stock con fotos).
3. En AbrigosPage agrega un estado "Próximamente": mensaje elegante serif "Abrigos y chaquetas, muy pronto" + CTA a las otras categorías, por si alguien llega por URL directa.
4. Deja un comentario en Header.jsx indicando cómo reactivar el ítem del menú.
```

### Prompt 4.3 — Mi Cuenta: decidir qué hacer
```
La página /mi-cuenta es decorativa: muestra 4 tarjetas (Perfil, Pedidos, Lista de Deseos, Configuración) cuyos links van todos a "#". No tenemos backend ni autenticación, así que prometen algo que no existe.

1. ELIMINA el acceso a /mi-cuenta del Header (el ícono de usuario) y de cualquier otro lugar.
2. En su lugar, el ícono de usuario del header puede eliminarse o reemplazarse por un link a /contacto.
3. Mantén la ruta /mi-cuenta pero conviértela en una página simple "Próximamente podrás crear tu cuenta" por si alguien la tiene guardada.
4. BONUS sin backend: implementa una "Lista de deseos" real usando localStorage (vm_wishlist): ícono de corazón en las ProductCards y página /favoritos que muestre los guardados. Esto SÍ aporta valor y no necesita servidor.
```

### Prompt 4.4 — Páginas Nosotros, Contacto y FAQ
```
Aplica la nueva identidad (cream/ink/clay, serif elegante, sin Unsplash, sin círculos blur) a:

1. AboutPage.jsx (/nosotros): reescribe con la historia REAL — Victoria Modas nace en Gamarra, Lima, con años vendiendo moda femenina al por mayor, y ahora lleva sus diseños directo a ti. Tono cálido y cercano, 2-3 secciones máximo: Historia / Nuestras telas (Scuba, Suplex, Lamé, Seda Francesa, Rit) / Compromiso de calidad. La foto de Unsplash que tiene: reemplázala por un placeholder con fondo cream y el logo, con comentario para que ponga una foto real del taller/tienda después.
2. ContactPage.jsx: formulario estilo editorial (inputs border-b hairline) + datos de contacto reales que ya están en el Footer (WhatsApp +51 993 357 672, victoriamodas1053@gmail.com, Facebook) + horario de atención. El formulario usa @emailjs/browser que ya está instalado — si no hay credenciales de EmailJS configuradas, que el botón haga fallback a abrir WhatsApp con el mensaje.
3. FAQPage.jsx: acordeón minimal con Disclosure de @headlessui. Reescribe las preguntas para el modelo real de negocio: ¿Cómo compro? (carrito → WhatsApp), ¿Métodos de pago? (Yape, Plin, transferencia, efectivo contra entrega en Lima), ¿Envíos? (Lima y provincias por Shalom/Olva), ¿Cambios?, ¿Venta al por mayor? (sí — menciona Gamarra).
```

### Prompt 4.5 — Footer completo
```
Rediseña Footer.jsx:
1. Fondo ink (oscuro cálido) con texto cream — contraste elegante de cierre, estilo House of CB.
2. 4 columnas en desktop (1 en móvil, apiladas): Logo + tagline breve / Tienda (categorías activas) / Ayuda (Contacto, FAQ, Nosotros) / Contacto directo (WhatsApp, email, dirección en Gamarra si quieres mostrarla).
3. Redes: deja Facebook (https://www.facebook.com/profile.php?id=61555283742078) y agrega placeholders comentados para Instagram y TikTok (los activaré cuando cree las cuentas).
4. Línea final: "© 2026 Victoria Modas — Lima, Perú" + "Hecho con cariño en Gamarra".
5. Quita cualquier emoji.
```

---

# FASE 5 — SEO, RENDIMIENTO Y CALIDAD

### Prompt 5.1 — SEO on-page completo
```
Implementa SEO para victoriamodas.store:

1. Instala react-helmet-async (o crea un hook useDocumentTitle/useMeta propio sin dependencias, mejor) para que cada ruta tenga título y description únicos:
   - / → "Victoria Modas — Moda femenina elegante | Lima, Perú"
   - /vestidos → "Vestidos elegantes para mujer | Victoria Modas"
   - (igual para blusas, pantalones, nosotros, contacto, FAQ)
   - /producto/:id → "{nombre del producto} | Victoria Modas"
2. En index.html agrega Open Graph y Twitter Cards completos: og:title, og:description, og:image (crea/usa public/og-image.jpg de 1200x630 — por ahora un placeholder con logo sobre fondo cream), og:url=https://victoriamodas.store, og:locale=es_PE, twitter:card=summary_large_image.
3. Crea public/robots.txt permitiendo todo y apuntando al sitemap.
4. Crea public/sitemap.xml con todas las rutas estáticas + las 6 URLs de producto.
5. Agrega JSON-LD en index.html: Organization (Victoria Modas, logo, redes) y en ProductPage genera dinámicamente el schema Product (nombre, imagen, marca).
6. lang="es" ya está en el html — verifica. Agrega meta theme-color con el nuevo cream #FBF7F4.
```

### Prompt 5.2 — Rendimiento
```
El bundle actual pesa 519 KB. Optimiza:

1. Code-splitting por ruta: convierte las importaciones de páginas en main.jsx a React.lazy() + Suspense con un fallback elegante (pantalla cream con el logo y un pulse sutil).
2. En vite.config.js configura build.rollupOptions.output.manualChunks para separar vendor (react, react-router) de la app.
3. Imágenes: agrega width/height o aspect-ratio a todas las <img> para evitar layout shift. Verifica que TODAS las imágenes bajo el fold tengan loading="lazy" y la del hero loading="eager" + fetchpriority="high".
4. Las imágenes PNG de productos son pesadas: crea un script scripts/optimize-images.mjs con sharp que genere versiones .webp de todo public/imagenes/ manteniendo los PNG como fallback, y actualiza ResponsiveImage.jsx para servir webp con <picture>. (El componente imageUtils.js está preparado para esto pero hoy es no-op.)
5. Ejecuta npm run build y reporta el tamaño final de cada chunk.
```

### Prompt 5.3 — Accesibilidad y pulido final
```
Pasada final de calidad:
1. Verifica contraste AA: texto ink sobre cream pasa, pero revisa ink-muted sobre cream y clay sobre cream en textos pequeños — si no pasan 4.5:1, oscurece los tonos en tailwind.config.js.
2. Todos los botones de ícono con aria-label en español.
3. Focus visible: anillo de foco focus-visible:ring-2 ring-clay en todos los elementos interactivos.
4. El hook de reduced-motion: verifica que las animaciones se desactivan con prefers-reduced-motion (había un CSS para esto que quizá se perdió al migrar a Tailwind — reimpleméntalo con la variante motion-reduce: de Tailwind).
5. Prueba las 12 rutas en móvil (viewport 390px) y corrige cualquier desborde horizontal.
6. npm run lint sin errores.
```

---

# FASE 6 — DEPLOY A VERCEL + DOMINIO

### Prompt 6.1 — Configuración de Vercel
```
Prepara el proyecto para Vercel:

1. Crea vercel.json en la raíz con la configuración para SPA (CRÍTICO — sin esto, /vestidos y todas las rutas dan 404 al recargar):
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/imagenes/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
2. Verifica que npm run build genera dist/ sin errores.
3. Haz commit de todo en la rama redesign-2026, mergea a main y push a GitHub.
```

### Pasos manuales 6.2 — Deploy (esto lo haces TÚ en el navegador, 10 min)
1. Entra a **vercel.com** → regístrate con tu cuenta de **GitHub** (GianPierooo).
2. **Add New → Project** → importa el repo **VictoriaModas**.
3. Vercel detecta Vite automáticamente. Verifica: Build Command `npm run build`, Output Directory `dist`. → **Deploy**.
4. En 2 minutos tendrás la web viva en `victoriamodas.vercel.app`. Pruébala completa.

### Pasos manuales 6.3 — Conectar victoriamodas.store
1. En Vercel: tu proyecto → **Settings → Domains** → escribe `victoriamodas.store` → Add.
2. Vercel te dará registros DNS. Ve al panel donde compraste el dominio y configura:
   - Registro **A** → nombre `@` → valor `76.76.21.21`
   - Registro **CNAME** → nombre `www` → valor `cname.vercel-dns.com`
3. Espera la propagación (minutos a 24h). Vercel emite el certificado SSL (https) solo.
4. En Vercel marca `victoriamodas.store` como dominio principal y `www` como redirect.

### Prompt 6.4 — Verificación post-deploy
```
La web ya está en https://victoriamodas.store. Hagamos verificación final:
1. Dame un checklist para probar: las 12 rutas cargan al entrar directo por URL (verifica el rewrite SPA), el checkout por WhatsApp abre con el mensaje correcto, las imágenes cargan, el sitio se ve bien en móvil.
2. Genera el código para registrar la web en Google Search Console (meta tag de verificación en index.html) y recuérdame enviar el sitemap.
```

---

# FASE 7 — FOTOS (la haces tú al final, guía incluida)

El código ya no dependerá de Unsplash, pero la web solo se verá 100% profesional cuando las fotos acompañen. Plan mínimo viable con celular:

**Equipo (~S/ 150-300):** fondo blanco o crema continuo (papelógrafo grande o tela planchada), 2 lámparas LED de luz blanca (o luz natural de ventana grande), trípode de celular.

**Las 3 tomas por producto que la web necesita:**
1. **Frente** (la principal del catálogo) — producto centrado, mismo encuadre SIEMPRE para que el grid se vea uniforme.
2. **Espalda** — mismo encuadre.
3. **Detalle** — textura de la tela de cerca (esto vende lo "premium").

**Reglas de oro:** mismo fondo, misma luz y misma distancia para TODAS las fotos (la consistencia es lo que se ve profesional); formato vertical 3:4 (la web usa aspect-[3/4]); exporta a buena resolución y nombra los archivos siguiendo el patrón existente (`color_adelante.png`, `color_atras.png`, `color_delado.png`).

**Para el hero y banners:** 2-3 fotos "editoriales" con modelo (una amiga, tú misma o quien sea) usando las prendas en un lugar bonito y luminoso. Una sola buena sesión de 2 horas te da material para toda la web y un mes de redes.

---

# 📅 RESUMEN DE EJECUCIÓN

| Fase | Qué logra | Tiempo estimado con Claude Code |
|------|----------|--------------------------------|
| 0 | Rama limpia + README | 15 min |
| 1 | Sistema de diseño nuevo (archivos listos) | 1 hora |
| 2 | Home profesional sin Unsplash | 2-3 horas |
| 3 | Catálogo + producto + carrito premium | 3-4 horas |
| 4 | Datos centralizados + páginas secundarias | 2-3 horas |
| 5 | SEO + rendimiento | 2 horas |
| 6 | Vivo en victoriamodas.store | 1 hora |
| 7 | Fotos (tú, cuando puedas) | 1 sesión |

**Total: la web puede estar viva y profesional en 2-3 días de trabajo tranquilo.**

---

# ⚠️ RECORDATORIOS IMPORTANTES

1. **Haz commit después de cada prompt exitoso.** Si algo sale mal, vuelves atrás sin drama.
2. **Prueba en móvil SIEMPRE** (DevTools → vista responsive 390px). Tus clientas comprarán desde el celular.
3. **No agregues precios** salvo que decidas cambiar el modelo — el flujo actual es carrito → WhatsApp y está bien para validar.
4. Este rediseño NO incluye pasarela de pago. Cuando valides ventas por WhatsApp y quieras cobrar online, retomamos la conversación de Mercado Pago/Tiendanube — está en otra liga de decisiones.
5. El nombre **House of CB** es solo referencia interna de estilo. Jamás copies sus fotos, textos o assets.
