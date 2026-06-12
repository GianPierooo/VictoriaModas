// ============================================================
// FUENTE ÚNICA DE PRODUCTOS — Victoria Modas
// ------------------------------------------------------------
// Todo el sitio (catálogo, detalle de producto y búsqueda) lee
// de aquí. Para añadir/editar un producto, hazlo SOLO en este
// archivo. Cada producto conserva todos sus campos:
//   id, name, description, badge, category, image, images,
//   sizes, colors, fabric, colorImages
//
// `category` es el slug en minúscula (coincide con la URL: /vestidos).
// `fabric` es la forma corta usada por el filtro de tela del catálogo.
// `image` es la foto frontal por defecto (= images[0]).
// ============================================================

export const PRODUCTS = [
  // ---------------- VESTIDOS ----------------
  {
    id: 'vestido-lame-elegante',
    name: 'Vestido Lame Elegante',
    description: 'Vestido elegante en tela lame con brillo sutil y caída impecable. Perfecto para ocasiones especiales.',
    badge: '-20%',
    category: 'vestidos',
    fabric: 'Lame',
    image: '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
    images: [
      '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
      '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_atras.png',
      '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_delado.png',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Plomo', 'Negro', 'Azul', 'Vino'],
    colorImages: {
      'Plomo': [
        '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png',
        '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_atras.png',
        '/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_delado.png',
      ],
      'Negro': [
        '/imagenes/vestidos/vestido_lame01/negro_adelante.png',
        '/imagenes/vestidos/vestido_lame01/negro_atras.png',
        '/imagenes/vestidos/vestido_lame01/negro_delado.png',
      ],
      'Azul': [
        '/imagenes/vestidos/vestido_lame01/azul_adelante.png',
        '/imagenes/vestidos/vestido_lame01/azul_atras.png',
        '/imagenes/vestidos/vestido_lame01/azul_delado.png',
      ],
      'Vino': [
        '/imagenes/vestidos/vestido_lame01/vino_defrente.png',
        '/imagenes/vestidos/vestido_lame01/vino_atras.png',
        '/imagenes/vestidos/vestido_lame01/vino_delado.png',
      ],
    },
  },
  {
    id: 'vestido-rit-elegante',
    name: 'Vestido Rit Elegante',
    description: 'Vestido elegante en tela Rit de primera calidad. Diseño sofisticado y moderno con excelente caída.',
    badge: '-24%',
    category: 'vestidos',
    fabric: 'Rit',
    image: '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png',
    images: [
      '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png',
      '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_atras.png',
      '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delado.png',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Beige', 'Negro', 'Plomo'],
    colorImages: {
      'Beige': [
        '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png',
        '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_atras.png',
        '/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delado.png',
      ],
      'Negro': [
        '/imagenes/vestidos/vestido_rit02/vestido_rit_negro_delante.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_negro_atras.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_negro_delado.png',
      ],
      'Plomo': [
        '/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_delante.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_atras.png',
        '/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_delado.png',
      ],
    },
  },
  {
    id: 'vestido-suplex-moderno',
    name: 'Vestido Suplex Moderno',
    description: 'Vestido moderno en suplex de alta calidad. Ajuste perfecto al cuerpo con diseño versátil y elegante.',
    badge: 'Nuevo',
    category: 'vestidos',
    fabric: 'Suplex',
    image: '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',
    images: [
      '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',
      '/imagenes/vestidos/vestido_suplex01/azul_atras.png',
      '/imagenes/vestidos/vestido_suplex01/azul_delado.png',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Azul', 'Blanco', 'Negro', 'Vino'],
    colorImages: {
      'Azul': [
        '/imagenes/vestidos/vestido_suplex01/azul_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/azul_atras.png',
        '/imagenes/vestidos/vestido_suplex01/azul_delado.png',
      ],
      'Blanco': [
        '/imagenes/vestidos/vestido_suplex01/blanco_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/blanco_atras.png',
        '/imagenes/vestidos/vestido_suplex01/blanco_delado.png',
      ],
      'Negro': [
        '/imagenes/vestidos/vestido_suplex01/negro_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/negro_atras.png',
        '/imagenes/vestidos/vestido_suplex01/negro_delado.png',
      ],
      'Vino': [
        '/imagenes/vestidos/vestido_suplex01/vino_adelante.png',
        '/imagenes/vestidos/vestido_suplex01/vino_atras.png',
        '/imagenes/vestidos/vestido_suplex01/vino_delado.png',
      ],
    },
  },

  // ---------------- BLUSAS ----------------
  {
    id: 'blusa-seda-francesa',
    name: 'Blusa Seda Francesa',
    description: 'Blusa elegante confeccionada en seda francesa premium. Diseño sofisticado y versátil, perfecta para looks casuales y formales.',
    badge: '-28%',
    category: 'blusas',
    fabric: 'Seda francesa',
    image: '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png',
    images: [
      '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png',
      '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_atras.png',
      '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_delado.png',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Azul', 'Negro', 'Plomo'],
    colorImages: {
      'Azul': [
        '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png',
        '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_atras.png',
        '/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_delado.png',
      ],
      'Negro': [
        '/imagenes/blusas/blusa_seda_francesa/negro_adelante.png',
        '/imagenes/blusas/blusa_seda_francesa/negro_atras.png',
        '/imagenes/blusas/blusa_seda_francesa/negro_delado.png',
      ],
      'Plomo': [
        '/imagenes/blusas/blusa_seda_francesa/plomo_adelante.png',
        '/imagenes/blusas/blusa_seda_francesa/plomo_atras.png',
        '/imagenes/blusas/blusa_seda_francesa/plomo_delado.png',
      ],
    },
  },

  // ---------------- PANTALONES ----------------
  {
    id: 'pantalon-scuba-vena',
    name: 'Pantalón Scuba Vena',
    description: 'Pantalón cómodo en tela scuba. Corte wide-leg con caída impecable y comodidad superior.',
    badge: '-20%',
    category: 'pantalones',
    fabric: 'Scuba',
    image: '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
    images: [
      '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
      '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_atras.png',
      '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_delado.png',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Azul', 'Camello', 'Vino', 'Plomo'],
    colorImages: {
      'Negro': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_delado.png',
      ],
      'Azul': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_defrente.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_delado.png',
      ],
      'Camello': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_delado.png',
      ],
      'Vino': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_delado.png',
      ],
      'Plomo': [
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_adelante.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_atras.png',
        '/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_delado.png',
      ],
    },
  },
  {
    id: 'pantalon-scuba-correa',
    name: 'Pantalón Scuba con Correa',
    description: 'Pantalón scuba moderno con correa decorativa, ideal para looks elegantes. Comodidad y estilo en una sola prenda.',
    badge: 'Nuevo',
    category: 'pantalones',
    fabric: 'Scuba',
    image: '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png',
    images: [
      '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png',
      '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_beach.png',
      '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_beach.png',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Beach', 'Negro', 'Azul', 'Plomo'],
    colorImages: {
      'Beach': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_beach.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_beach.png',
      ],
      'Negro': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_negro.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_negro.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_negro.png',
      ],
      'Azul': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_azul.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_azul.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_azul.png',
      ],
      'Plomo': [
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_plomo.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_plomo.png',
        '/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_plomo.png',
      ],
    },
  },
]

// ---------------- Helpers ----------------

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null
}

export function getProductsByCategory(category) {
  if (!category) return []
  const slug = category.toLowerCase()
  return PRODUCTS.filter(p => p.category.toLowerCase() === slug)
}

export function searchProducts(query) {
  const term = (query || '').trim().toLowerCase()
  if (!term) return []
  return PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term) ||
    (p.fabric && p.fabric.toLowerCase().includes(term))
  )
}
