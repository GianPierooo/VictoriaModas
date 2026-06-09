import React from 'react';
import ProductsPage from '../components/ProductsPage';

const PantalonesPage = () => {
  const products = [
    {
      id: "pantalon-scuba-vena",
      name: "Pantalón Scuba Vena",
      description: "Pantalón cómodo en tela scuba con caída impecable",
      badge: "-20%",
      image: "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png",
      images: [
        "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png",
        "/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_atras.png",
        "/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_delado.png"
      ],
      category: "pantalones",
      sizes: ["S", "M", "L"],
      colors: ["Negro", "Azul", "Camello", "Vino", "Plomo"],
      fabric: "Scuba",
      colorImages: {
        "Negro": [
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_negro_adelante.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_atras.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_Scuba_negro_delado.png"
        ],
        "Azul": [
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_defrente.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_atras.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_azul_delado.png"
        ],
        "Camello": [
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_adelante.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_atras.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_camello_delado.png"
        ],
        "Vino": [
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_adelante.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_atras.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_vino_delado.png"
        ],
        "Plomo": [
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_adelante.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_atras.png",
          "/imagenes/pantalones/pantalon_scuba/Pantalon_scuba_plomo_delado.png"
        ]
      }
    },
    {
      id: "pantalon-scuba-correa",
      name: "Pantalón Scuba con Correa",
      description: "Pantalón scuba moderno con correa decorativa, ideal para looks elegantes",
      badge: "Nuevo",
      image: "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png",
      images: [
        "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png",
        "/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_beach.png",
        "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_beach.png"
      ],
      category: "pantalones",
      sizes: ["S", "M", "L"],
      colors: ["Beach", "Negro", "Azul", "Plomo"],
      fabric: "Scuba",
      colorImages: {
        "Beach": [
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_beach.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_beach.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_beach.png"
        ],
        "Negro": [
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_negro.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_negro.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_negro.png"
        ],
        "Azul": [
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_azul.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_azul.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_azul.png"
        ],
        "Plomo": [
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delante_plomo.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_atras_plomo.png",
          "/imagenes/pantalones/pantalon_scuba_correa/p_correa_delado_plomo.png"
        ]
      }
    }
  ];

  return (
    <ProductsPage 
      products={products}
      title="PANTALONES MODERNOS"
      category="pantalones"
      filters={{
        availableSizes: [
          { label: 'S', count: 2 },
          { label: 'M', count: 2 },
          { label: 'L', count: 2 },
        ],
        availableFabrics: [
          { label: 'Scuba', count: 2 }
        ]
      }}
    />
  );
};

export default PantalonesPage;
