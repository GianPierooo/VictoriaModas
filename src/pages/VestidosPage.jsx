import React from 'react';
import ProductsPage from '../components/ProductsPage';

const VestidosPage = () => {
  const products = [
    {
      id: "vestido-lame-elegante",
      name: "Vestido Lame Elegante",
      description: "Vestido elegante en tela lame con brillo sutil y caída impecable. Perfecto para ocasiones especiales.",
      badge: "-20%",
      image: "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png",
      images: [
        "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png",
        "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_atras.png",
        "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_delado.png"
      ],
      category: "vestidos",
      sizes: ["S", "M", "L"],
      colors: ["Plomo", "Negro", "Azul", "Vino"],
      fabric: "Lame",
      colorImages: {
        "Plomo": [
          "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_adelante.png",
          "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_atras.png",
          "/imagenes/vestidos/vestido_lame01/vestido_lame_plomo01_delado.png"
        ],
        "Negro": [
          "/imagenes/vestidos/vestido_lame01/negro_adelante.png",
          "/imagenes/vestidos/vestido_lame01/negro_atras.png",
          "/imagenes/vestidos/vestido_lame01/negro_delado.png"
        ],
        "Azul": [
          "/imagenes/vestidos/vestido_lame01/azul_adelante.png",
          "/imagenes/vestidos/vestido_lame01/azul_atras.png",
          "/imagenes/vestidos/vestido_lame01/azul_delado.png"
        ],
        "Vino": [
          "/imagenes/vestidos/vestido_lame01/vino_defrente.png",
          "/imagenes/vestidos/vestido_lame01/vino_atras.png",
          "/imagenes/vestidos/vestido_lame01/vino_delado.png"
        ]
      }
    },
    {
      id: "vestido-rit-elegante",
      name: "Vestido Rit Elegante",
      description: "Vestido confeccionado en tela Rit de alta calidad con diseño sofisticado",
      badge: "-24%",
      image: "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png",
      images: [
        "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png",
        "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_atras.png",
        "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delado.png"
      ],
      category: "vestidos",
      sizes: ["S", "M", "L"],
      colors: ["Beige", "Negro", "Plomo"],
      fabric: "Rit",
      colorImages: {
        "Beige": [
          "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delante.png",
          "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_atras.png",
          "/imagenes/vestidos/vestido_rit02/vestido02_tela_rit_delado.png"
        ],
        "Negro": [
          "/imagenes/vestidos/vestido_rit02/vestido_rit_negro_delante.png",
          "/imagenes/vestidos/vestido_rit02/vestido_rit_negro_atras.png",
          "/imagenes/vestidos/vestido_rit02/vestido_rit_negro_delado.png"
        ],
        "Plomo": [
          "/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_delante.png",
          "/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_atras.png",
          "/imagenes/vestidos/vestido_rit02/vestido_rit_plomo_delado.png"
        ]
      }
    },
    {
      id: "vestido-suplex-moderno",
      name: "Vestido Suplex Moderno",
      description: "Vestido moderno confeccionado en suplex de alta calidad. Ajuste perfecto y diseño versátil para cualquier ocasión.",
      badge: "Nuevo",
      image: "/imagenes/vestidos/vestido_suplex01/azul_adelante.png",
      images: [
        "/imagenes/vestidos/vestido_suplex01/azul_adelante.png",
        "/imagenes/vestidos/vestido_suplex01/azul_atras.png",
        "/imagenes/vestidos/vestido_suplex01/azul_delado.png"
      ],
      category: "vestidos",
      sizes: ["S", "M", "L"],
      colors: ["Azul", "Blanco", "Negro", "Vino"],
      fabric: "Suplex",
      colorImages: {
        "Azul": [
          "/imagenes/vestidos/vestido_suplex01/azul_adelante.png",
          "/imagenes/vestidos/vestido_suplex01/azul_atras.png",
          "/imagenes/vestidos/vestido_suplex01/azul_delado.png"
        ],
        "Blanco": [
          "/imagenes/vestidos/vestido_suplex01/blanco_adelante.png",
          "/imagenes/vestidos/vestido_suplex01/blanco_atras.png",
          "/imagenes/vestidos/vestido_suplex01/blanco_delado.png"
        ],
        "Negro": [
          "/imagenes/vestidos/vestido_suplex01/negro_adelante.png",
          "/imagenes/vestidos/vestido_suplex01/negro_atras.png",
          "/imagenes/vestidos/vestido_suplex01/negro_delado.png"
        ],
        "Vino": [
          "/imagenes/vestidos/vestido_suplex01/vino_adelante.png",
          "/imagenes/vestidos/vestido_suplex01/vino_atras.png",
          "/imagenes/vestidos/vestido_suplex01/vino_delado.png"
        ]
      }
    }
  ];

  return (
    <ProductsPage 
      products={products}
      title="VESTIDOS ELEGANTES"
      category="vestidos"
      filters={{
        availableSizes: [
          { label: 'S', count: 3 },
          { label: 'M', count: 3 },
          { label: 'L', count: 3 },
        ],
        availableFabrics: [
          { label: 'Lame', count: 1 },
          { label: 'Rit', count: 1 },
          { label: 'Suplex', count: 1 }
        ]
      }}
    />
  );
};

export default VestidosPage;
