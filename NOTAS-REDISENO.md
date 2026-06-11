# Notas del Rediseño 2026 — Victoria Modas

Registro cronológico de cada cambio del rediseño, fase por fase.
Stack: React 19 + Vite + Tailwind CSS 3. Trabajamos directamente sobre `main`.

> **Red de seguridad:** commit `checkpoint: estado previo al rediseño 2026` (`e564289`).
> Para volver a ese punto exacto: `git reset --hard e564289`.

---

## Fase 0 — Preparación del terreno (2026-06-11)

- ✅ Commit checkpoint del estado previo al rediseño (`e564289`).
- ✅ Verificado `npm run build` — compila sin errores (solo warnings de datos
  desactualizados de `caniuse-lite`/`baseline-browser-mapping`, inofensivos).
- ✅ Verificado `npm run dev` — arranca correctamente y responde HTTP 200.
- ✅ Revisada carpeta `archivos-listos/` — contiene **5** archivos (no 4):
  `tailwind.config.js`, `Header.jsx`, `ProductCard.jsx`, `Hero-nuevo.jsx`
  y además `PLAN-MAESTRO.md`. Todos llegaron íntegros.
- ✅ Eliminado `src/assets/react.svg` (no se importaba en ningún lado; la
  carpeta `src/assets/` quedó vacía y desapareció).
- ⚠️ `src/App.css` **no existía** en el proyecto, así que no hubo nada que borrar.
- ⏸️ `public/vite.svg` se mantiene por ahora (se reemplazará al poner el favicon).
- 📝 Pendiente de revisar: `src/test-tailwind.html` parece un archivo de prueba
  sobrante; no se tocó porque no estaba en la lista. Confirmar si se borra.

---

## Fase 1 — Sistema de diseño

### 1.1 Nueva paleta de color cálida-premium (2026-06-11)

- ✅ Reemplazado `tailwind.config.js` con la versión de `archivos-listos/`.
  Nueva paleta:
  - **cream** `#FBF7F4` (fondo principal) / `#F4EDE7` (variante oscura) — fondos cálidos en vez de blanco frío.
  - **rose empolvado** `#E8B4B8` (principal, escala 50–500) — acento femenino, no saturado.
  - **clay** `#C08B7D` (+ light/dark) — terracota para detalles, hovers y acentos.
  - **ink** `#2B2424` / soft `#5B5150` / muted `#8A7E7C` — texto cálido en vez de negro/gris puros.
  - Sombras nuevas: `shadow-rose*` recalibradas en tonos clay + `shadow-soft`.
  - `tracking-luxe` (0.28em) para textos en mayúsculas.
  - Gradientes `gradient-rose*` actualizados a los tonos nuevos.
- ✅ El reemplazo es un **superconjunto** del config anterior: todas las clases
  antiguas (`rose-50/100/200`, `rose-light`, `rose-dark`, `shadow-rose*`,
  `gradient-rose*`) siguen existiendo con valores nuevos → nada se rompe,
  solo cambia el tono. Verificado además que no había hex antiguos
  (`#f7cac9`, etc.) hardcodeados en ningún componente ni CSS.
- ✅ Extra: alineado el skeleton loader `.animate-shimmer` de `src/index.css`,
  que usaba grises fríos (`#f0f0f0`/`#e0e0e0`) → ahora usa cream-dark `#F4EDE7`
  y rose-200 `#EFD0CC`, coherente con los fondos cálidos.
- ✅ `npm run build` compila sin errores tras el cambio.
- 📝 Pendiente detectado para próximos pasos: las clases `.btn-primary`,
  `.btn-secondary`, `.btn-outline` y `.btn-white` de `src/index.css` siguen
  usando `gray-900`/`white` (fríos). Migrarlas a `ink`/`cream` cuando
  rediseñemos los componentes que las usan (Header en el paso 1.2).

### 1.2 Header legible y responsive (2026-06-11)

- ✅ Reemplazado `src/components/Header.jsx` con la versión de `archivos-listos/`:
  - Logo tipográfico: "Victoria" serif light + "Modas" itálica clay (sin emoji ✨).
  - Texto del header SIEMPRE en ink/ink-soft — legible sobre fondos claros.
  - Menú desktop en mayúsculas pequeñas con `tracking-[0.15em]`, link activo
    con subrayado clay; estilo boutique.
  - Al hacer scroll: `bg-cream/90 backdrop-blur-md shadow-soft`.
  - Mismo posicionamiento que antes (`fixed top-8` bajo el AnnouncementBanner),
    no rompe el layout.
- ✅ CRÍTICO corregido — el menú móvil del archivo venía con estilo viejo
  (`bg-white`, textos `gray-*`, logo con emoji, CTA `bg-rose` texto blanco,
  © 2025). Rediseñado al sistema nuevo:
  - Panel `bg-cream`, logo tipográfico igual al desktop, botón cerrar ink.
  - Nav principal estilo boutique (uppercase + tracking), link activo con
    fondo cream-dark; se eliminó el `HomeIcon` repetido 5 veces.
  - Sección "Apoyo" con label `tracking-luxe` ink-muted e iconos con hover clay.
  - Acciones: "Mi Cuenta" cream-dark/ink, "Carrito" ink/cream hover clay.
  - Separadores `border-ink/10`, footer serif sin emoji, © 2026.
- ✅ También corregidos (venían con paleta vieja en el archivo nuevo):
  - Dropdown "Ayuda" desktop: `bg-white`/grises → cream/ink/clay.
  - Skip-link de accesibilidad: `bg-rose text-white` (contraste pobre) → `bg-ink text-cream`.
  - Badge contador del carrito (desktop y móvil): `bg-rose text-white` →
    `bg-clay-dark text-cream` (mejor contraste).
  - Eliminada variable `isHomePage` sin uso y el import de `HomeIcon`.
- ✅ Prueba responsive (preview + estilos computados):
  - **375px**: logo sin desborde, hamburguesa OK; menú móvil verificado
    abierto — panel cream `#FBF7F4`, links ink-soft, activo cream-dark,
    Carrito ink/cream; sin overflow horizontal.
  - **768px**: hamburguesa visible (nav desktop entra en `lg`), logo Bodoni
    Moda ink, sin overflow.
  - **1280px**: los 10 elementos del nav en orden sin solapamientos, links
    12px uppercase tracking 1.8px, estado scrolled aplica `bg-cream/90`
    (verificado por estilo computado; el renderer del preview congelaba las
    transiciones CSS, no era un bug del sitio).
- ✅ `npm run build` compila sin errores; `eslint` del Header limpio.
- 🔧 Añadido `.claude/launch.json` (config del preview, puerto 5180).

### 1.3 Cards de producto dinámicas y responsive (2026-06-11)

- ✅ Reescrito `src/components/ProductCard.jsx` tomando como base el estilo de
  `archivos-listos/` (cream/ink/clay, foto protagonista, info mínima centrada)
  y ampliado con las interacciones dinámicas:
  - **Crossfade al hover** (500ms ease-out) entre la vista frontal y la
    segunda imagen (espalda/lado) usando `images`/`colorImages`. Si el
    producto solo tiene una imagen → zoom lento `scale(1.08)` en 1.2s.
  - **Swatches de color**: círculos con los colores reales (mapa COLOR_HEX);
    hover/focus/tap cambia la foto a las imágenes de ese color con
    **crossfade de tres capas** (la imagen anterior queda debajo mientras la
    nueva aparece con fade — sin parpadeos blancos). Swatch activo con
    `ring-clay` + `aria-pressed`. Máximo 4 visibles + indicador "+N".
    Área táctil de 40×40px exactos (verificado).
  - **Quick-add "Ver detalle"**: sube con translate+fade al hover en desktop
    (`lg:`); en móvil siempre visible y discreto (cream/90 + blur, 41px de alto).
  - **Badge pill discreto** cream/90 con blur, uppercase `tracking-luxe`;
    las ofertas (%) en `text-clay-dark`, el resto en ink. Nada de círculos.
  - **Entrada al viewport** con IntersectionObserver (una vez, threshold
    0.15): fadeInUp 700ms con escalonado por columna (`index % 4 × 90ms`).
    Respeta `prefers-reduced-motion` (revela sin animar).
  - Swatches fuera del `<Link>` para que tocar un color no navegue.
- ✅ **Catálogo unificado**: eliminado el `CatalogProductCard` interno de
  `ProductsPage.jsx` (~165 líneas duplicadas con paleta vieja); ahora home y
  catálogo usan exactamente la misma card. De paso se eliminó código muerto
  (`handleAddToCart`, `toggleFabric`, `availableFabrics`, `viewMode`, imports
  sin uso) — el lint de ProductsPage pasó de 5 errores a 0.
- ✅ **Grids responsive** unificados a 2/3/4 columnas:
  - Catálogo: `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`.
  - Home destacados: `grid-cols-2 lg:grid-cols-4`; se quitó el wrapper
    animado de HomePage (la entrada ahora la maneja cada card, evitando
    doble animación).
- ✅ Verificado en preview (estilos computados): móvil 375 → 2 col, cards
  166px, CTA visible, swatches 40px, sin overflow; tablet 768 → 3 col de
  227px; desktop → 4 col; swatch click cambia frente y espalda al color
  elegido. Cero errores de consola. (El renderer del preview congela
  transiciones/IO — verificado que opacity/transform finales son correctos
  desactivando la transición, mismo artefacto que en 1.2.)
- ✅ `npm run build` sin errores; lint de ProductCard y ProductsPage limpio.
- 📝 Límites respetados: sin sombras de color, sin bounce, sin rotaciones,
  sin gradientes llamativos; máx. 2 animaciones simultáneas, 400–700ms
  ease-out (zoom 1.2s solo como caso sin segunda imagen, según spec).

### 1.4 Logo y favicon preparados con fallback (2026-06-11)

- ✅ **Header**: el logo ahora es isotipo + texto tipográfico. `<img
  src="/logo/isotipo.png">` con `h-8` móvil / `h-10` desktop junto a
  "Victoria"+*Modas*; si la imagen no existe, `onError` la oculta y queda
  solo el texto (la web nunca se ve rota). Mismo tratamiento en el logo del
  menú móvil. El conjunto ícono+texto es el link a "/".
- ✅ **Footer**: reemplazado el emoji ✨ por el isotipo con cadena de
  fallback: `isotipo-blanco.png` → `isotipo.png` → solo texto.
  ⚠️ El footer actual tiene fondo CLARO (gradiente rosa); si se queda claro
  tras su rediseño, invertir el orden (primero `isotipo.png`) o la versión
  blanca no se distinguirá. Anotado también en el LEEME.
- ✅ Creada `public/logo/` con `LEEME.txt`: especifica `isotipo.png` (512px
  lado mayor, fondo transparente), `isotipo-blanco.png` (versión clara) y
  que `favicon.png` (512×512) va en `public/`.
- ✅ **Favicon temporal** generado (System.Drawing): cuadrado cream `#FBF7F4`
  con iniciales "VM" en serif (Georgia) color clay `#C08B7D` y filete
  interior sutil. `public/favicon.png` (512) + `public/apple-touch-icon.png`
  (180). Se reemplazan cuando llegue el logo real.
- ✅ **index.html**: favicon → `/favicon.png`, añadido `apple-touch-icon`,
  eliminadas TODAS las referencias a `/vite.svg` (icon, og:image,
  twitter:image → ahora `/favicon.png`), y `theme-color` claro actualizado
  de `#f7cac9` (rosa viejo) a `#FBF7F4` (cream).
- ✅ Eliminado `public/vite.svg` (pendiente desde la Fase 0, ya reemplazado).
- ✅ Verificado en preview: header y footer ocultan la img y muestran solo
  texto (cadena del footer recorrida: blanco→normal→oculto); favicon y
  apple-touch-icon servidos; simulada la llegada del logo real → la img
  aparece a 40px junto al texto. Build sin errores, lint limpio.

---

## Fase 2 — Home

### 2.1 Hero editorial con producto real (2026-06-11)

- ✅ Reemplazada la función `Hero()` de `src/pages/HomePage.jsx` con la
  versión editorial de `archivos-listos/Hero-nuevo.jsx`. Fuera el slider
  viejo: 3 fotos de Unsplash, autoplay con `setInterval`, parallax,
  círculos flotantes con `blur-3xl` y CTAs con gradiente animado
  (~129 líneas → ~60).
- ✅ El hero nuevo:
  - 2 columnas: texto editorial a la izquierda ("Elegancia / *hecha para
    ti*" con la segunda línea itálica clay), foto grande de producto REAL a
    la derecha (`/imagenes/vestidos/vestido_suplex01/azul_adelante.png`,
    verificada su existencia) con marco interior elegante.
  - Fondo cream con 2 acentos radiales rosa muy sutiles (sin blur-3xl,
    sin animaciones flotantes).
  - CTA principal pill `bg-ink` → clay al hover; secundaria pill outline.
  - Indicador "Descubre ↓" (solo desktop, `hidden lg:flex`).
- ✅ Limpieza de imports: eliminado `ChevronLeftIcon` (huérfano tras quitar
  el slider). `useState/useRef/useEffect` se conservan (los usa el hook
  `useScrollAnimation`). Bonus: desaparecieron 1 error y 1 warning de lint
  que vivían en el slider viejo (`sliderRef` sin uso, dep de `scroll`).
- ✅ Responsive verificado (estilos computados en preview):
  - **375px**: apilado con la foto ARRIBA y el texto abajo (`order-1/2`),
    título 48px sin desborde, CTAs a ancho completo de 48–50px de alto,
    sin overflow horizontal.
  - **768px**: 1 columna (el grid pasa a 2 en `lg`), título 60px, sin overflow.
  - **1280px**: 2 columnas texto-izq/foto-der, título 72px, itálica clay
    `#C08B7D`, CTA ink `#2B2424` con texto cream, "Descubre" visible.
  - Cero errores de consola.
- ✅ `npm run build` sin errores; lint de HomePage sin errores (solo un
  warning preexistente del hook `useScrollAnimation`, ajeno a este cambio).

### 2.2 Categorías con productos reales (2026-06-11)

- ✅ Reescrita la sección `CategoryShowcase` de `HomePage.jsx`:
  - Solo 3 categorías REALES: **Vestidos**, **Blusas** y **Pantalones**.
    Eliminadas "Conjuntos" y "Bodys" (no existen; además enlazaban a
    /vestidos). Abrigos fuera hasta que haya productos con foto.
  - Fotos de producto reales en vez de Unsplash (existencia verificada):
    vestido_lame01 negro / blusa seda francesa / pantalón scuba correa negro.
  - Cada card: imagen vertical `aspect-[3/4]`, overlay degradado ink sutil
    abajo (se intensifica al hover), nombre en serif cream grande, zoom
    lento `scale-105` en 1s al hover, esquinas `rounded-lg`, link a su
    página de categoría.
  - Encabezado: eyebrow "Colecciones" en `tracking-luxe` clay + título
    serif "Encuentra tu estilo" en ink, centrado, `py-24`.
  - Fuera todo el ruido viejo: círculos flotantes con blur-3xl, borde
    brillante interior, sombras rosa neón, botón circular del hover,
    `rounded-3xl` y `hover:scale-105` de la card entera.
  - Entrada al scroll conservada (hook `useScrollAnimation` existente) con
    escalonado de 120ms por card.
- ✅ Responsive verificado: 375px → 1 columna a ancho completo, imágenes
  cargadas, sin overflow; 768px → 3 columnas de 219px, `py-24` aplicado.
- ✅ Build sin errores; lint sin errores nuevos.
- 📝 Pendiente detectado: quedan 3 fotos de Unsplash más abajo en HomePage
  (~línea 612, sección de telas/spotlight) — candidatas para el siguiente
  paso de la Fase 2.

### 2.3 Home limpio sin Unsplash ni recargo (2026-06-11)

- ✅ **Limpieza global**: eliminados TODOS los divs decorativos de círculos
  con blur (`blur-3xl` + `animate-float/breathe/pulse-soft`), líneas
  decorativas, rombos, brillos de hover, bordes neón interiores y sombras
  rosa. Fondos planos alternados para dar ritmo:
  Hero **cream** → Destacados **white** → Colecciones **cream** →
  Categorías **white** → Spotlight **cream** → Social **white**.
- ✅ **FeaturedProducts**: encabezado nuevo (eyebrow "Destacados"
  tracking-luxe clay + "Nuestros más vendidos" serif ink); ya usaba el
  ProductCard dinámico en grid 2/4. CTA pill ink→clay (antes gradiente rosa
  con sombra neón).
- ✅ **Collections** (2 banners grandes): overlay ink limpio que se
  intensifica al hover, texto serif cream, link subrayado fino,
  `rounded-lg`, zoom 1s; fuera ~9 capas decorativas por banner.
- ✅ **CategoryShowcase**: pasado a `bg-white` (alternancia) y
  `py-20 md:py-28`; delays recortados a ≤350ms.
- ✅ **ProductSpotlight**: imagen real conservada
  (vestido_suplex01/azul_adelante.png); fuera radial animado y la caja
  flotante "-24%" con `animate-float` → ahora badge pill discreto sobre la
  foto. Título serif light "Vestido Suplex / *Moderno*" (itálica clay) en
  vez de mayúsculas bold; detalles con punto clay; CTA pill ink.
- ✅ **SocialFavorites**: imágenes reales conservadas (verificadas);
  eliminado el emoji 📸 con su badge; fuera el `blur-sm` al hover y la
  decoración de rombos; overlay ink, `rounded-lg`; CTA de Facebook pasa de
  botón azul corporativo a pill outline ink elegante (conserva el ícono).
- ✅ **BlogNoticias ELIMINADA por completo** (función + render): era la
  única fuente de Unsplash restante (3 fotos) y un blog falso resta
  credibilidad. Se reactivará cuando haya contenido real.
- ✅ Animaciones de scroll (`useScrollAnimation`) conservadas; todas
  recortadas a fadeInUp sutiles `duration-700` con delays ≤400ms
  (antes había delay-500/700/1000 y duration-1000).
- ✅ **Verificación grep**: `unsplash` en HomePage.jsx → **0 resultados**;
  también 0 restos de `blur-3xl`, `animate-float/breathe`, grises fríos
  (`gray-*`) ni `rose-900/400` en la página.
- ✅ Responsive verificado (375/768/1280): 6 secciones, alternancia
  cream/white exacta, cero imágenes rotas, cero errores de consola, sin
  overflow horizontal en ningún tamaño (el `scrollWidth` extra del hero son
  los acentos radiales recortados por `overflow-hidden`, invisible). Grids:
  destacados 2→2→4, colecciones 1→2→2, categorías 1→3→3, social 1→2→3.
- ✅ Build sin errores; lint de HomePage con 0 errores.

### 2.4 Banner y WhatsApp pulidos (2026-06-11)

- ✅ **AnnouncementBanner**: rediseñado sobrio y elegante.
  - Sin emojis. Mensajes nuevos: "Envío gratis en compras mayores a S/ 200"
    · "Nueva colección disponible" · "Atención personalizada por WhatsApp"
    (fuera el "Primavera 2025" y el código SPRING20 caducos).
  - Fondo `bg-ink`, texto cream, uppercase. Rotan cada 4s con **fade suave**
    (animación `fadeIn` 0.7s disparada por `key={current}`, no corte brusco).
  - Responsive: `text-[10px] tracking-[0.15em]` en móvil →
    `sm:text-xs sm:tracking-[0.2em]`; verificado que el texto NO se corta a
    375px (banner 35px de alto, sin overflow).
  - Limpieza: eliminado el estado `scrolled` que se calculaba pero nunca se
    usaba en el render.
- ✅ **Botón flotante WhatsApp** (en Footer.jsx): de exagerado a elegante.
  - Círculo de 56px (`h-14 w-14`), fondo `#25D366`, ícono WhatsApp blanco
    `h-7 w-7`, `shadow-soft`.
  - Eliminadas las animaciones recargadas: gradiente verde de 3 paradas,
    `animate-ping`, `animate-pulse-soft`, `hover:scale-125`,
    `hover:rotate-12`. Ahora solo aparición suave al cargar (`fadeIn` 0.6s) y
    un `hover:scale-105` discreto. (Verificado: 0 pings restantes.)
  - Tooltip discreto solo desktop (`hidden lg:block`): "¿Tienes dudas?
    Escríbenos", pill ink/cream, opacity 0 → 100 al hover. En móvil no se
    renderiza.
  - Posición `bottom-6 right-6`; enlace a wa.me/51993357672 con
    `target="_blank"` + `rel="noopener noreferrer"`.
- ✅ Build sin errores; lint limpio en banner y footer.

---

**Fase 2 (Home) COMPLETA**: hero editorial, categorías reales, limpieza
integral sin Unsplash ni recargo, y banner + WhatsApp pulidos. El home está
coherente de arriba a abajo con el sistema cálido-premium.

---

## Fase 3 — Catálogo y páginas

### 3.1 Catálogo rediseñado con filtros responsive (2026-06-11)

- ✅ Reescrito `src/components/ProductsPage.jsx` completo (compartido por
  Vestidos/Blusas/Pantalones/Abrigos):
  - **Cabecera**: fondo cream plano, eyebrow "Colección" tracking-luxe clay,
    título serif font-light normalizado a sentence case ("VESTIDOS
    ELEGANTES" → "Vestidos elegantes"), contador "X piezas" en ink-muted.
    Fuera el hero rosa con blur-3xl y drop-shadows.
  - **Cards**: ya usaban el ProductCard compartido desde la Fase 1.3
    (el CatalogProductCard interno se eliminó entonces).
  - **Filtros**: de sidebar a barra horizontal limpia bajo la cabecera.
    Desktop (md+): dropdowns Popover minimal (Talla / Color / Tela) con
    contador "· N" en el botón activo, toggles pill "Nuevo"/"Oferta",
    select de orden y "Limpiar". Móvil: botón "Filtrar" (con badge clay de
    filtros activos) que abre un **bottom sheet** con Dialog de
    @headlessui (asa, secciones, CTA "Ver N piezas" que se actualiza en
    vivo, limpiar).
  - **🐛 Bug del filtro de tela ARREGLADO**: `availableFabrics` se pasaba
    como prop pero nunca filtraba. Implementado de verdad: dropdown/sección
    "Tela" que compara contra `product.fabric` (Lame, Rit, Suplex, Scuba,
    Seda francesa). Si la página no pasa la prop, las telas se derivan de
    los productos (igual que tallas y colores).
  - **Grid**: `grid-cols-2 md:grid-cols-3 xl:grid-cols-4` con
    `gap-x-6 gap-y-12`.
  - **Estado vacío**: "No encontramos piezas con esos filtros" en serif +
    botón pill ink "Limpiar filtros".
  - Eliminado el buscador propio del sidebar (redundante: el header ya
    tiene SearchModal global con Ctrl+K). La prop `category` quedó sin uso
    y se retiró de la firma (las páginas pueden seguir pasándola).
- ✅ `COLOR_HEX` movido a `src/utils/colorUtils.js` (compartido por
  ProductCard y los swatches de filtros; antes vivía duplicado).
- ✅ Verificación funcional en preview:
  - Móvil 375: cabecera correcta, grid 2 col, panel móvil abre/cierra,
    **todas las áreas táctiles 44–48px**, filtro Lame → "Ver 1 pieza" y
    1 card; Lame+Nuevo → estado vacío serif; limpiar restaura las 3.
  - Tablet 768: barra desktop visible, grid 3 col, sin overflow.
  - Desktop 1280: popover Tela abre con Lame/Rit/Suplex, Suplex → 1 card y
    botón "Tela · 1", grid 4 col, botón móvil oculto, sin overflow.
  - Cero errores de consola.
- ✅ Build sin errores; lint limpio.

### 3.2 Página de producto premium (2026-06-11)

- ✅ Reescrito `src/pages/ProductPage.jsx` completo al estilo boutique
  cream/ink/clay. Fuera toda la estética vieja: gradientes rosa, sombras
  neón `[0_0_20px_rgba(247,202,201)]`, círculos border-4, rating falso de
  estrellas, y los botones "Comprar ahora" / "Agregar a favoritos" (no
  funcionales).
- ✅ **Layout desktop** (`lg:`): grid de 5 columnas → galería `col-span-3`
  (60%) + info `col-span-2` (40%) con la info en `lg:sticky lg:top-28`.
  Móvil/tablet: una sola columna (el split entra en `lg`/1024).
- ✅ **Galería**: miniaturas verticales al lado en desktop
  (`lg:flex-row` + `lg:flex-col`), en fila debajo de la principal en móvil
  (`flex-col-reverse`). Click en miniatura cambia la principal con fade
  (animación por `key`). Miniatura activa con `ring-clay`. **Swipe táctil**
  en móvil (touchstart/touchend, umbral 50px) — verificado que avanza/
  retrocede. Al cambiar de color, la galería se recarga con las imágenes
  de ese color desde `colorImages`.
- ✅ **Panel info**: eyebrow categoría clay · nombre serif 3xl font-light
  ink · descripción ink-soft · selector de color (círculos 32px, activo
  ring-clay, nombre del color visible al lado) · tallas (pills
  rectangulares, activa rellena ink, soporte de `disabled` con line-through
  para `product.unavailableSizes` — capacidad lista, datos actuales no
  marcan ninguna) · `QuantitySelector` existente · botón "Agregar al
  carrito" pill ink full-width → clay (dispara la CartNotification global,
  verificado: badge del header sube y aparece el panel) · "Consultar por
  WhatsApp" outline con ícono y mensaje pre-armado (nombre + color + talla).
- ✅ **Acordeón** con `Disclosure` de @headlessui, separadores hairline
  `border-ink/10`: "Detalles y tela" / "Envíos" / "Cambios y devoluciones"
  con contenido real y breve.
- ✅ **"También te puede gustar"**: hasta 4 `ProductCard` de la MISMA
  categoría excluyendo el actual (se añadió `category` a cada entrada del
  mock; helper `toCardProduct` arma el shape que consume la card, usando el
  set de color por defecto para que el hover tenga crossfade).
- ✅ **colorMap unificado**: `src/utils/colorUtils.js` (creado en 3.1)
  renombrado a `src/utils/colorMap.js` con `git mv`; ProductCard,
  ProductsPage y ProductPage importan `COLOR_HEX` desde ahí. Eliminado el
  `colorMap` local duplicado de ProductPage.
- ✅ Extra: al navegar entre detalles (`productId` cambia) se reinician
  imagen/color/talla/cantidad y se hace scroll al top.
- ✅ Verificado en preview:
  - Desktop 1280: grid 5 col, galería span-3, info sticky, 3 miniaturas,
    4 colores a 32px, botón ink, WhatsApp con texto pre-armado y
    `target=_blank`, 3 secciones de acordeón (Envíos abre), 2 relacionados
    (los otros vestidos). Cambio a Negro recarga galería; thumb 2 → atras;
    agregar → notificación con "Vestido Lame · Negro · S".
  - Móvil 375: 1 columna, miniaturas en fila debajo de la imagen, swipe
    cambia de vista, botón carrito 48px de alto y ancho completo, colores y
    tallas con 44px de área táctil, info no sticky, sin overflow.
  - Tablet 768: 1 columna, relacionados en 2 col, sin overflow.
  - Cero errores de consola.
- ✅ Build sin errores; lint limpio.

### 3.3 Carrito y checkout pulidos + fix de IDs (2026-06-11)

- ✅ **🐛 BUG CRÍTICO arreglado** en `CartContext.jsx`: `removeItem` y
  `updateQuantity` usaban el ÍNDICE del array como identificador, frágil
  (al quitar un item los demás se descuadraban). Ahora usan una **clave
  estable compuesta** `${id}__${color}__${talla}` vía helper `cartItemKey`.
  Verificado en preview: con 3 items, quitar el del MEDIO deja exactamente
  los correctos, y subir la cantidad de uno NO altera la de otro.
  - `cartItemKey` vive en `src/utils/cart.js` (archivo nuevo) — importado por
    CartContext y CartPage. Se separó del contexto para no romper la regla
    `react-refresh/only-export-components` (el único error que queda en
    CartContext es el de `useCart`, **preexistente**, no introducido aquí).
  - **Persistencia protegida**: `loadStoredCart()` tolera carritos viejos o
    corruptos (no-array, items sin id, cantidad inválida) sin crashear; la
    clave se deriva de los campos existentes, sin migración.
- ✅ **CartPage** rediseñado: filas con foto `rounded-lg` + nombre serif +
  color/talla en ink-muted uppercase + `QuantitySelector` + botón quitar (X
  discreto, 44×44 de área táctil), separadas por hairline `border-ink/10`.
  Resumen sticky (solo desktop) con total + "Finalizar pedido" pill ink→clay
  (→ /checkout) + nota "Coordinaremos pago y envío contigo por WhatsApp".
  Vacío elegante: `ShoppingBagIcon`, serif "Tu carrito está esperando" + CTA
  a /vestidos.
- ✅ **CheckoutPage** rediseñado: inputs editoriales `border-b` hairline (sin
  cajas grises), labels uppercase tracking-luxe. Campos: nombre, teléfono,
  ciudad/distrito, notas (opcional). Validación sutil: borde clay al enfocar,
  rojo suave + mensaje si falta un obligatorio (verificado: submit vacío
  bloquea y marca 3 errores). **Pantalla de confirmación** tras enviar:
  "¡Pedido enviado! Te responderemos pronto por WhatsApp" + resumen del
  pedido + "Volver al inicio". Maneja también el caso de carrito vacío.
- ✅ **whatsappUtils.js**: eliminados los emojis (👤📋📦💬🙏); títulos en
  *negrita* de WhatsApp. Nueva `generateOrderMessage(formData, items)` con
  datos del cliente + detalle (producto, color, talla, cantidad) + total.
  Verificado el mensaje generado: limpio y completo. Número unificado en una
  constante.
- ✅ **QuantitySelector** armonizado a la paleta ink (pill, borde ink/20,
  foco clay) — mejora de paso CartPage y ProductPage (su API no cambió).
- ✅ Responsive verificado (375/768/1280): carrito y checkout a 1 columna en
  móvil/tablet con el resumen DEBAJO (no sticky), 2 col en desktop con
  resumen sticky; submit y finalizar 48px, quitar 44×44, inputs sin caja;
  sin overflow horizontal; cero errores de consola.
- ✅ Build sin errores; lint de archivos nuevos/tocados limpio.

📝 Pendientes para fases siguientes (estética vieja aún viva):
- **Footer**: gradiente rosa con `border-t-4 border-rose-dark`, emoji ✨ ya
  retirado del logo (Fase 1.4) pero el resto sigue con grises/rosa viejo.
- Páginas internas: About, Contact, FAQ, AccountPage.
- `CartNotification.jsx`: aún con estética rosa/gris vieja (y el swatch usa el
  nombre del color en español como CSS, que no renderiza). Candidato a pulir.
- `src/index.css`: las clases `.btn-*` aún usan `gray-900`/`white`.
- `src/test-tailwind.html`: archivo de prueba sobrante, confirmar si se borra.
