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
