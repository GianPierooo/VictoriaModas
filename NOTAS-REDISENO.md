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

---

## Fase 4 — Arquitectura y páginas restantes

### 4.1 Productos centralizados en un solo archivo (2026-06-11)

- ✅ Creado **`src/data/products.js`** como fuente ÚNICA: array `PRODUCTS`
  con los 6 productos y todos sus campos (id, name, description, badge,
  category, image, images, sizes, colors, fabric, colorImages). Antes
  estaban DUPLICADOS en las páginas de categoría + el `MOCK_PRODUCTS` de
  ProductPage, con riesgo de desincronización.
- ✅ Helpers exportados: `getProductById(id)`, `getProductsByCategory(category)`
  (case-insensitive), `searchProducts(query)` (busca en nombre, categoría y
  tela; vacío → []).
- ✅ **Decisiones de fusión** (cuando las dos fuentes diferían):
  - `description` → versión de MOCK (es la que muestra el detalle → la
    página de producto queda idéntica).
  - `fabric` → forma corta (Lame, Rit, Suplex, Seda francesa, Scuba) → el
    filtro de tela del catálogo conserva exactamente sus etiquetas.
  - `category` → slug minúscula (vestidos/blusas/pantalones), coincide con
    las URLs; ProductPage capitaliza para el breadcrumb.
  - `image` = `images[0]`; `images`, `colorImages`, `sizes`, `colors` eran
    idénticas entre fuentes y se conservan.
- ✅ Refactor de consumidores:
  - VestidosPage, BlusasPage, PantalonesPage, AbrigosPage → `getProductsByCategory()`,
    cada una pasó de ~60–135 líneas a **9 líneas**. Dejaron de pasar la prop
    `filters` (ProductsPage ya deriva tallas/telas/colores de los productos,
    con los mismos labels y conteos que los hardcodeados).
  - ProductPage → `getProductById()`; eliminados el `MOCK_PRODUCTS` local
    (~210 líneas), el helper `toCardProduct` y el mapa `CATEGORY_PATH`.
    Relacionados ahora con `getProductsByCategory().filter(...)`.
  - SearchModal → `searchProducts()`; eliminado su `ALL_PRODUCTS` local.
- ✅ **VERIFICACIÓN CRÍTICA (no perder nada)**:
  - Diff de rutas de imagen viejas (git HEAD: 3 páginas + ProductPage) vs
    nuevo archivo: **69 rutas únicas en ambos, 0 diferencias** (ni perdidas
    ni cambiadas).
  - Firma por producto: 6 productos, mismo orden por categoría, cada color
    con sus 3 imágenes, sizes/fabric/badge correctos, `image===images[0]`.
  - En preview: catálogo idéntico (Vestidos 3 / Pantalones 2 / Abrigos
    vacío), detalle ok (swatch Camello carga sus imágenes, relacionados
    correctos), filtro de tela derivado muestra Lame/Rit/Suplex y filtra
    bien. Cero errores de consola.
  - Único cambio de texto menor y documentado: el acordeón "Detalles y tela"
    ahora lee "Confeccionado en {tela corta}." (p.ej. "en scuba.") en vez de
    la forma larga del MOCK; el contenido sigue siendo correcto.
- ✅ Responsive sin cambios (refactor de datos, no de layout): catálogo 2 col
  y detalle 1 col en móvil, sin overflow.
- ✅ Build sin errores; lint limpio en todos los archivos tocados.
- 🎯 Deja el terreno listo para migrar a panel admin / backend: solo habría
  que cambiar la implementación de los 3 helpers, sin tocar componentes.

### 4.2 Abrigos en estado próximamente (2026-06-11)

- ✅ **Header**: ítem "ABRIGOS"/"Abrigos" oculto del menú desktop y del menú
  móvil. NO se borró: ambas líneas quedaron **comentadas** con una nota clara
  arriba del array `navigation` indicando exactamente qué descomentar (las dos
  líneas `// { ... '/abrigos' }`) para reactivarlo.
- ✅ **Footer**: eliminada la categoría "Abrigos" de la lista (con comentario
  que remite a la nota del Header para reactivar).
- ✅ **AbrigosPage** convertida en estado "Próximamente" elegante (sin tocar
  su ruta en main.jsx): usa `Layout`, fondo cream, eyebrow "Próximamente"
  clay, título serif "Abrigos y chaquetas, *muy pronto*", texto cálido breve
  y 3 CTAs outline a Vestidos / Blusas / Pantalones. Lleva además un
  comentario con los 3 pasos para reactivar la categoría cuando haya stock.
- ✅ La ruta `/abrigos` sigue activa: si alguien llega por URL directa ve el
  estado Próximamente en vez de un catálogo vacío.
- ✅ Verificado en preview: ABRIGOS ausente del nav desktop, del menú móvil
  (Inicio/Blusas/Pantalones/Vestidos) y de las categorías del footer; página
  centrada y sin overflow en desktop (1280) y móvil (375), CTAs apilados de
  46px en móvil. Cero errores de consola.
- ✅ Build sin errores; lint limpio.

### 4.3 Favoritos funcionales + mi cuenta honesta (2026-06-11)

**Parte A — Mi Cuenta:**
- ✅ Eliminado el icono de usuario del Header desktop; en su lugar va el
  corazón de favoritos (ver parte B). En el menú móvil, la acción rápida
  "Mi Cuenta" pasó a ser "Favoritos". Ya no se enlaza /mi-cuenta desde el
  header (icono `UserIcon` eliminado de imports y de ambos sitios).
- ✅ `AccountPage` reescrita como página honesta "Próximamente" (cream,
  serif "Tu cuenta, *muy pronto*", texto cálido, CTAs a Seguir comprando y
  Ver favoritos). Se mantiene la ruta /mi-cuenta. Eliminados los enlaces a
  "#" del panel decorativo anterior (verificado: sin links rotos).

**Parte B — Favoritos reales (localStorage, sin backend):**
- ✅ Nuevo `src/context/WishlistContext.jsx` (espejo de CartContext): guarda
  un array de ids en localStorage bajo `vm_wishlist`. Expone
  `toggleFavorite(id)`, `isFavorite(id)`, `favorites` y `count`. Carga
  defensiva (no-array/duplicados/ids no-string se descartan). Funciones con
  `useCallback` para no recrear el value en cada render.
- ✅ App envuelta con `WishlistProvider` en main.jsx (dentro de CartProvider).
- ✅ **Corazón en cada ProductCard** (arriba a la derecha): contorno
  (`HeartIcon`) cuando no es favorito, relleno clay (`HeartIconSolid`)
  cuando sí. Click hace `preventDefault`+`stopPropagation` para NO navegar
  al producto (el corazón vive dentro del `<Link>`). Microinteracción: pop
  `scale-125` 220ms al marcar + `active:scale-90`. Área táctil 40×40px.
- ✅ **Página `/favoritos`** (registrada en main.jsx): resuelve ids →
  productos con `getProductById` (descarta ids inexistentes) y los muestra
  con el ProductCard, mismo grid que el catálogo (2/3/4 col). Vacío
  elegante: `HeartIcon`, serif "Aún no has guardado favoritos" + CTA a
  /vestidos.
- ✅ **Corazón en el Header** junto al carrito → /favoritos, con badge
  contador clay-dark (mismo estilo que el del carrito). También en la acción
  rápida del menú móvil, con su badge.
- ✅ Verificado en preview (todo el flujo, desktop + móvil):
  - Header sin /mi-cuenta, con corazón → /favoritos; badge aparece/crece/
    desaparece según el conteo.
  - Marcar 2 corazones en el catálogo NO navega; persisten en localStorage;
    /favoritos los muestra; quitar desde la propia página actualiza en vivo;
    vaciar muestra el estado vacío serif. Persistencia tras reload OK.
  - Móvil 375: corazón de card 40×40, menú móvil con "Favoritos" (badge) y
    sin "Mi Cuenta", /favoritos en 2 col, sin overflow. Cero errores de
    consola.
- ✅ Build sin errores; lint limpio (el hook `useWishlist` lleva un
  `eslint-disable` explícito de `react-refresh/only-export-components`, como
  patrón limpio para el archivo de contexto).

### 4.4 Páginas Nosotros, Contacto y FAQ reales (2026-06-11)

- ✅ **AboutPage (/nosotros)** reescrita con la historia real y tono cálido
  en primera persona: encabezado "De Gamarra, *directo a ti*" + 3 secciones:
  "Nuestra historia" (nace en Gamarra, años de mostrador, ahora directo a la
  clienta final), "Nuestras telas" (lista editorial con Scuba, Suplex, Lamé,
  Seda Francesa y Rit con su detalle), "Nuestro compromiso" (calidad,
  atención cercana, hecho en Perú). La foto de Unsplash → placeholder cream
  con el nombre tipográfico y comentario en el código: "REEMPLAZAR por foto
  real del taller o de la tienda". CTA final a la colección.
- ✅ **ContactPage (/contacto)** rediseñada: formulario editorial border-b
  hairline (nombre / correo o teléfono / mensaje) con validación sutil
  (borde clay al enfocar, rojo suave + mensaje si falta; verificado submit
  vacío → 3 errores). Datos reales al lado en tarjeta cream: WhatsApp
  +51 993 357 672, correo victoriamodas1053@gmail.com, Facebook (link del
  footer) y horario placeholder "Lun a Sáb, 9am - 7pm" (comentado para
  ajustar).
  - **EmailJS**: ⚠️ hallazgo — las credenciales YA estaban hardcodeadas en
    el archivo (service/templates/publicKey). Ahora se leen de variables de
    entorno `VITE_EMAILJS_*` con esas credenciales como respaldo (el envío
    actual no se rompe). Si no hubiera ninguna → fallback directo a
    WhatsApp; y si `emailjs.send` FALLA en runtime → también abre WhatsApp
    con el mensaje pre-armado (la clienta nunca queda sin canal). Antes se
    enviaban 2 correos (admin+cliente); ahora 1 (admin) — el template de
    cliente queda en la config por si se reactiva.
- ✅ **FAQPage (/preguntas-frecuentes)** reescrita: acordeón minimal con
  `Disclosure` + separadores hairline (mismo patrón que el de ProductPage),
  con las 5 preguntas del modelo real: cómo comprar (carrito→WhatsApp),
  métodos de pago (Yape/Plin/transferencia/efectivo contra entrega en Lima),
  envíos (Lima 2-4 días; provincias Shalom/Olva 4-7), cambios (7 días, sin
  uso, por WhatsApp), mayoreo (sí, mención a Gamarra). Textos marcados como
  base editable. CTA final a /contacto. Eliminados el buscador interno, las
  categorías con emojis (📦) y los blur del diseño viejo.
- ✅ Responsive verificado (375/768/1280): nosotros 1 col→historia 2 col y
  compromisos 3 col; contacto con campos lado a lado en md+, submit 48px
  full-width en móvil; FAQ con botones de acordeón de 68–96px de alto;
  sin overflow en ninguna; cero errores de consola; 0 unsplash/blur-3xl.
- ✅ Build sin errores; lint limpio.

### 4.5 Footer premium oscuro (2026-06-11)

- ✅ `Footer.jsx` reescrito por completo: fondo **ink** con texto **cream**
  (contraste boutique que cierra el sitio). Fuera el gradiente rosa, los 3
  círculos `blur-3xl` animados, el "LIBRO DE RECLAMACIONES" con emoji 📖, el
  "✨ WhatsApp 24/7", los links a `#` (seguimiento, políticas, bases legales,
  política de datos, nuestras tiendas) y las animaciones `hover:translate`/
  `rotate-12` recargadas.
- ✅ **4 columnas** (1 en móvil, 2 en `sm`, 4 en `lg`):
  - Marca: isotipo claro (cadena de fallback blanco→normal→solo texto, ahora
    el isotipo-blanco SÍ corresponde al fondo oscuro) + logo tipográfico
    ("Modas" en clay-light) + tagline "Moda femenina con intención · Lima, Perú".
  - **Tienda**: Vestidos, Blusas, Pantalones (sin Abrigos).
  - **Ayuda**: Contacto, Preguntas frecuentes, Nosotros, Favoritos.
  - **Contacto**: WhatsApp +51 993 357 672 (link wa.me), correo
    victoriamodas1053@gmail.com, y "Gamarra, Lima — Perú".
- ✅ **Redes**: Facebook activo (link del footer anterior). Instagram y TikTok
  añadidos pero **comentados** en el código, con sus íconos SVG listos y el
  comentario "Descomentar cuando se creen las cuentas".
- ✅ **Línea final** (border-top hairline `border-cream/10`): "© 2026 Victoria
  Modas — Lima, Perú" + "Hecho con cariño en Gamarra" (apilados y centrados en
  móvil, a los extremos en `sm+`). Año fijo 2026 (ya no `new Date()`).
- ✅ Conservado intacto el botón flotante de WhatsApp (Fase 2.4): #25D366,
  bottom-6 right-6, tooltip desktop.
- ✅ Sin emojis, sin links muertos a `#`. Contraste verificado: marca cream,
  "Modas" clay-light, links cream/70→cream al hover, títulos cream/50.
- ✅ Responsive (375/768/1280): 4→2→1 columnas, links de texto con área táctil
  de 32px (subida desde 16px con `py-1.5`), Facebook 40px, sin overflow en
  ningún tamaño, cero errores de consola.
- ✅ Build sin errores; lint limpio.

🎉 **Rediseño 2026 completo**: todas las superficies del sitio (sistema de
diseño, home, catálogo, producto, carrito/checkout, favoritos, páginas de
contenido, header y footer) están en la identidad cálida-premium cream/ink/clay.

---

## Fase 5 — SEO y técnico

### 5.1 SEO completo: meta, OG, sitemap, JSON-LD (2026-06-11)

- ✅ **Hook propio `src/hooks/useDocumentMeta.js`** (sin dependencias nuevas):
  actualiza `document.title`, meta description y, en espejo, og:title/
  og:description y twitter:title/description al montar cada página. Acepta un
  `jsonLd` opcional que inyecta un `<script type="application/ld+json">` y lo
  limpia al desmontar (verificado: el schema Product desaparece al salir del
  producto).
- ✅ **Títulos/descripciones únicos por ruta** aplicados con el hook:
  / · /vestidos · /blusas · /pantalones · /nosotros · /contacto ·
  /preguntas-frecuentes · /producto/:id (título dinámico `{nombre} | Victoria
  Modas`). Extra: también /favoritos, /carrito, /checkout, /mi-cuenta y
  /abrigos, para que no quede un título obsoleto al navegar.
- ✅ **index.html**: OG y Twitter Cards completos → og:type=website,
  og:site_name, og:locale=es_PE, og:url=https://victoriamodas.store,
  og:title/description, og:image=…/og-image.jpg (1200×630, con width/height),
  twitter:card=summary_large_image + title/description/image. theme-color
  consolidado a `#FBF7F4` (se quitó la variante dark, el sitio no tiene dark
  mode). Añadido `<link rel="canonical">`. URLs migradas de victoriamodas.com
  → victoriamodas.store. Marca normalizada a "Victoria Modas".
- ✅ **`public/og-image.jpg`** generado (placeholder 1200×630: cream con
  "Victoria Modas" en serif clay + tagline). Reemplazable por uno con el
  logo real.
- ✅ **`public/robots.txt`**: `User-agent: * / Allow: /` + `Sitemap:
  https://victoriamodas.store/sitemap.xml`.
- ✅ **`public/sitemap.xml`**: 8 rutas estáticas (home, vestidos, blusas,
  pantalones, nosotros, contacto, preguntas-frecuentes, favoritos) + las 6
  URLs de producto reales, con changefreq/priority.
- ✅ **JSON-LD**:
  - `Organization` estático en index.html (nombre, url, logo, og-image,
    email, dirección Gamarra/Lima/PE, sameAs Facebook).
  - `Product` dinámico en ProductPage (name, description, brand "Victoria
    Modas", category, image[] con URLs absolutas). **Sin price** (modelo por
    WhatsApp), según lo pedido.
- ✅ `<html lang="es">` confirmado.
- ✅ Verificado en preview: títulos/descripciones cambian por ruta; en el
  producto conviven Organization + Product y el Product se limpia al salir;
  robots.txt, sitemap.xml y og-image.jpg se sirven (200, content-type
  correcto). Build sin errores; lint sin errores nuevos (solo el warning
  preexistente del hook de scroll de HomePage). Archivos estáticos presentes
  en `dist/`.

### 5.2 Code-splitting + imágenes WebP (2026-06-11)

- ✅ **Code-splitting por ruta** (`main.jsx`): las 13 páginas pasaron a
  `React.lazy()` + `<Suspense>`. Cada ruta se descarga solo al visitarse.
  Fallback `PageLoader` elegante (fondo cream, nombre tipográfico centrado con
  `motion-safe:animate-pulse-soft`), importado de forma eager para estar
  disponible al instante.
- ✅ **manualChunks** (`vite.config.js`): todo `node_modules` va a chunks
  cacheables aparte del código de la app → `vendor` (react, react-dom,
  react-router + libs) y `ui` (@headlessui + @heroicons). El entry dejó de
  arrastrar código de librería.
- ✅ **Imágenes → WebP**:
  - `scripts/optimize-images.mjs` (sharp como devDependency) recorre
    `public/imagenes/` y genera un `.webp` por cada png/jpg, conservando los
    originales. Idempotente (salta los que ya están al día). Script en
    package.json: `npm run optimize-images`. Ejecutado: **73 webp generados**.
  - `ResponsiveImage.jsx` reescrito como `<picture>` con `<source>` webp +
    `<img>` png de fallback (deriva la ruta webp del src). Aplicado en: hero,
    ProductCard (las 3 capas del crossfade), galería de producto (principal +
    miniaturas), las 4 secciones de imagen del home y los thumbnails de
    carrito/checkout. Verificado: el navegador carga `.webp` en todos.
- ✅ **CLS / prioridad de carga**: contenedores con `aspect-[]` (ya
  existentes) reservan el espacio → sin saltos. Imagen del hero y principal
  del producto con `loading="eager"` + `fetchPriority="high"`; el resto
  `loading="lazy"`. Se añadieron `width`/`height` a las imágenes.
- ✅ Responsive verificado (375/1280): hero/cards/galería sirven webp, el
  crossfade de color y el toggle de favorito (sobre la `<picture>`) siguen
  funcionando, navegación lazy OK, carrito tras recarga sirve webp, sin
  overflow, cero errores de consola.

  **📊 Antes / después de tamaños (build de producción):**

  | | Antes (5.1) | Después (5.2) |
  |---|---|---|
  | JS app | **1 bundle de 519.71 KB** (gzip 151.98) | dividido en chunks |
  | `vendor` (react/router/libs) | — | 298 KB (gzip 96.7) · cacheado |
  | `ui` (headlessui/heroicons) | — | 99.4 KB (gzip 30.9) · cacheado |
  | entry `index` | (dentro del bundle) | **6.84 KB** (gzip 2.73) |
  | app compartida | — | 31.5 KB (gzip 7.8) |
  | chunks por ruta | — | 0.3 – 15.5 KB c/u (lazy) |
  | **Imágenes** | **68.7 MB PNG** | **1.5 MB WebP (−98%)** |

  El gran win real-world es la imagen (−98%, el peso dominante de la web) más
  que el JS: el total de JS es parecido (mismo código), pero ahora `vendor`/
  `ui` se cachean entre navegaciones y deploys, el entry es minúsculo, y cada
  ruta carga solo su porción (0.4–4 KB gzip) en vez de los ~152 KB completos.
- ✅ Build sin errores; lint limpio (solo el warning preexistente de
  HomePage). Los `.webp` se commitean (el deploy sirve `public/` tal cual).

### 5.3 Accesibilidad y pulido final (2026-06-11)

- ✅ **Contraste AA (4.5:1)** — medido con WCAG. Tres tonos NO llegaban sobre
  cream y se oscurecieron en `tailwind.config.js`:
  | token | antes | ratio | ahora | ratio |
  |---|---|---|---|---|
  | `clay` | #C08B7D | 2.73 ❌ | **#9C5F4E** | 4.74 ✅ |
  | `clay-dark` | #A06E60 | 4.03 ❌ | **#8A5340** | 5.81 ✅ |
  | `ink-muted` | #8A7E7C | 3.68 ❌ | **#756967** | 4.96 ✅ |
  `clay-light` se mantiene (#D7B3A8) porque solo se usa como texto claro sobre
  ink (7.9:1). `ink`/`ink-soft` ya pasaban (14.3 / 7.2). El clay quedó un punto
  más terracota/profundo, coherente con la estética premium.
- ✅ **ARIA**: auditados los botones de solo ícono. Faltaban dos en
  `SearchModal` (cerrar y limpiar) → añadidos "Cerrar búsqueda" / "Limpiar
  búsqueda". El resto (carrito, favoritos, búsqueda, menú, cerrar menú,
  corazón de card, cerrar filtros, cantidad) ya tenían `aria-label`/sr-only.
- ✅ **Focus visible por teclado**: regla global en `index.css` (`:focus-visible`
  → `outline: 2px solid clay; outline-offset: 2px`) para links, botones,
  inputs, selects, textarea, summary y `[tabindex]`. Verificado que la regla
  compila y usa clay.
- ✅ **Reduced motion**: bloque `@media (prefers-reduced-motion: reduce)` en
  `index.css` que reduce a ~0 todas las animaciones, transiciones y el
  scroll suave. Complementa el guard de JS que ya tenía ProductCard.
- ✅ **Lint**: `npm run lint` pasó de 5 problemas a **0 errores, 0 warnings**.
  - `archivos-listos/` (plantillas de referencia) añadido a los ignores de
    eslint (2 errores eran de ahí).
  - Eliminado `src/utils/imageUtils.js` (227 líneas de utilidades muertas, sin
    imports) → quitó 1 error.
  - `useCart` de CartContext con `eslint-disable` explícito (igual que
    `useWishlist`) → quitó el error preexistente de react-refresh.
  - Capturado `ref.current` en el hook `useScrollAnimation` → quitó el warning.
- ✅ Build sin errores.

**📱 Prueba móvil exhaustiva (375px, las 12 rutas) — hallazgos y arreglos:**
- ✅ **Cero scroll horizontal** en las 12 rutas (home, vestidos, blusas,
  pantalones, abrigos, producto, carrito, checkout, favoritos, nosotros,
  contacto, FAQ). `scrollWidth` = 375 en todas.
- 🔧 **Swatches de color encogían a 34px** en cards con 4+ colores (flex los
  comprimía). Fijados a 40×40 con `flex-shrink-0` + `flex-wrap`. (ProductCard)
- 🔧 **"Vaciar carrito" medía 16px de alto** (texto suelto). Subido a 32px con
  `py-2`. (CartPage)
- ℹ️ El acento radial decorativo del hero se extiende más allá del viewport
  pero está recortado por `overflow-hidden` (no genera scroll). No es un fallo.
- ℹ️ Las 2 "imágenes rotas" del home son los placeholders del isotipo
  (`/logo/isotipo.png`, aún inexistente); su `onError` las oculta y se ve el
  logo de texto — el fallback de la Fase 1.4 funcionando.
- ✅ Sin texto cortado, imágenes deformadas ni elementos encimados; todos los
  controles táctiles ≥ 40px tras los arreglos. Cero errores de consola en
  producción (en dev hay ruido de HMR de `createRoot`, inexistente en build).

📝 Pendientes menores que quedan (no críticos):
- `CartNotification.jsx`: aún con estética rosa/gris vieja (y el swatch usa el
  nombre del color en español como CSS, que no renderiza). Candidato a pulir.
- `src/index.css`: las clases `.btn-*` aún usan `gray-900`/`white` (ya no se
  usan en las páginas rediseñadas; revisar referencias antes de migrarlas).
- `src/test-tailwind.html`: archivo de prueba sobrante, confirmar si se borra.
- Logos reales: soltar `isotipo.png` / `isotipo-blanco.png` en `public/logo/`
  y `favicon.png` real en `public/` (ver `public/logo/LEEME.txt`).
- Foto real del taller/tienda en AboutPage (hay placeholder + comentario).
- `public/og-image.jpg`: placeholder; reemplazar por uno con el logo real.
