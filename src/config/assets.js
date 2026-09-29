// ============================================================
// ASSETS REEMPLAZABLES — Victoria Modas
// ------------------------------------------------------------
// ÚNICO lugar donde viven las rutas de los assets "editoriales" que el
// dueño puede reemplazar. Regla de oro: TODO consumidor de estas rutas
// debe tener fallback (onError → imagen/placeholder elegante), así que
// puedes soltar el archivo en /public y encaja solo — y si no existe,
// nada se rompe.
//
// Cómo reemplazar cada uno:
//  1. Sube el archivo a la ruta indicada dentro de /public.
//  2. Si es imagen nueva (png/jpg), corre `npm run optimize-images`
//     para generar su .webp (ResponsiveImage lo usa automáticamente).
//  3. No hace falta tocar código: la ruta ya apunta ahí.
//     (Solo si prefieres OTRA ruta/nombre, cámbiala aquí, en un solo sitio.)
// ============================================================

export const ASSETS = {
  // ── Videos editoriales del Home (secciones grandes) ────────
  // Loops cortos, mudos, comprimidos (~2-3 MB c/u). Se montan diferidos
  // (solo al entrar la sección en pantalla y tras el primer paint), con la
  // imagen de la sección como poster/fallback. Si el archivo no existe o
  // falla la carga, queda la imagen y nada se rompe. Se DESACTIVAN con
  // prefers-reduced-motion.
  carruselVideo1: '/videos/carrusel-1.mp4', // fondo de "Vestidos elegantes" (Colecciones)
  carruselVideo2: '/videos/carrusel-2.mp4', // fondo de "Pantalones modernos" (Colecciones)
  carruselVideo3: '/videos/carrusel-3.mp4', // fondo del "Producto destacado" (Spotlight)

  // ── Detalles de tela (insets de banners Home) ──────────────
  // Foto macro de la tela (~800×1000, 4:5). null = se usa un acercamiento
  // de la propia prenda (no se rompe nada).
  fabricLame: null,   // sugerido: '/imagenes/telas/lame-detalle.jpg'
  fabricScuba: null,  // sugerido: '/imagenes/telas/scuba-detalle.jpg'
  fabricSuplex: null, // sugerido: '/imagenes/telas/suplex-detalle.jpg'

  // ── Nosotros ───────────────────────────────────────────────
  // Foto real del taller/tienda (Perú). Horizontal 4:3 (~1200×900).
  // Mientras no exista, la página muestra un placeholder tipográfico.
  tallerImage: '/imagenes/nosotros/taller.jpg',
}
