// ============================================================
// BANNERS DEL CARRUSEL DE LA HOME — Victoria Modas
// ------------------------------------------------------------
// Las imágenes ya traen el título y el logo dentro (16:9, 1672×941), así que
// el carrusel no les pone texto encima. Archivos en
// public/imagenes/banners/<archivo>.webp (+ <archivo>-900.webp para móvil).
//
// El ORDEN de este arreglo es el orden en pantalla. Para cambiar una imagen:
// reemplaza el WebP con el mismo nombre (y su versión -900) o agrega otra
// entrada aquí.
//
// `to`: a dónde lleva el clic. El Pantalón Palazo todavía no está activo en el
// catálogo, así que sus banners llevan a la categoría, no a una ficha que no
// existe. Cuando se active, cambiar esos `to` a '/producto/pantalon-palazo'.
// ============================================================
export const BANNERS_HOME = [
  {
    archivo: 'elige-tu-estilo',
    alt: 'Elige tu estilo: pantalones Normal, Palazzo y Con Correa en un mismo look',
    to: '/pantalones',
  },
  {
    archivo: 'scuba-normal-modelo',
    alt: 'Scuba Normal: pantalón negro de corte recto con blusa crema — básicos que combinan contigo',
    to: '/producto/pantalon-scuba-vena',
  },
  {
    archivo: 'scuba-normal-colores',
    alt: 'Pantalón Scuba Normal en azul marino, crema, negro, marrón y vino, tallas S, M y L',
    to: '/producto/pantalon-scuba-vena',
  },
  {
    archivo: 'elegancia-que-se-nota',
    alt: 'Elegancia que se nota: pantalón negro con correa y hebilla circular',
    to: '/producto/pantalon-scuba-correa',
  },
  {
    archivo: 'scuba-correa-modelo',
    alt: 'Scuba con Correa: pantalón taupe con hebilla circular — detalles que elevan tu look',
    to: '/producto/pantalon-scuba-correa',
  },
  {
    archivo: 'scuba-correa-colores',
    alt: 'Pantalón Scuba con Correa en negro, crema, taupe, gris y marrón chocolate, tallas S, M y L',
    to: '/producto/pantalon-scuba-correa',
  },
  {
    archivo: 'scuba-palazzo-modelo',
    alt: 'Scuba Palazzo: pantalón celeste de pierna ancha — caída elegante para cada ocasión',
    to: '/pantalones',
  },
  {
    archivo: 'scuba-palazzo-colores',
    alt: 'Pantalón Scuba Palazzo en negro, celeste, verde olivo, crema y vino, tallas S, M y L',
    to: '/pantalones',
  },
]

export const rutaBanner = (archivo, ancho) => `/imagenes/banners/${archivo}${ancho ? `-${ancho}` : ''}.webp`
