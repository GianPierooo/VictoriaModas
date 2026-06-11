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
