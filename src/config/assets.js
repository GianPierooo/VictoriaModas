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
  // ── Hero del Home ──────────────────────────────────────────
  // Video de fondo "tejido en movimiento". MP4 H.264 comprimido (~3-6 MB,
  // loop corto 6-12s, sin audio). El .webm es opcional (mejor compresión);
  // el navegador elige el primero que soporte.
  heroVideoWebm: '/videos/hero.webm',
  heroVideoMp4: '/videos/hero.mp4',
  // Imagen editorial del hero (LCP + poster del video). Vertical 4:5 o
  // similar, mínimo ~1600px de ancho. Hoy usa una foto de producto.
  heroImage: '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',

  // ── Detalles de tela (insets de banners Home) ──────────────
  // Foto macro de la tela (~800×1000, 4:5). null = se usa un acercamiento
  // de la propia prenda (no se rompe nada).
  fabricLame: null,   // sugerido: '/imagenes/telas/lame-detalle.jpg'
  fabricScuba: null,  // sugerido: '/imagenes/telas/scuba-detalle.jpg'
  fabricSuplex: null, // sugerido: '/imagenes/telas/suplex-detalle.jpg'

  // ── Nosotros ───────────────────────────────────────────────
  // Foto real del taller/tienda en Gamarra. Horizontal 4:3 (~1200×900).
  // Mientras no exista, la página muestra un placeholder tipográfico.
  tallerImage: '/imagenes/nosotros/taller.jpg',
}
