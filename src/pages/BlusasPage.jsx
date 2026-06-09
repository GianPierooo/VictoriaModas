import React from 'react';
import ProductsPage from '../components/ProductsPage';

const BlusasPage = () => {
  const products = [
    {
      id: "blusa-seda-francesa",
      name: "Blusa Seda Francesa",
      description: "Blusa elegante confeccionada en seda francesa premium. Diseño sofisticado y versátil, perfecta para looks casuales y formales. Comodidad y estilo en una sola prenda.",
      badge: "-28%",
      image: "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png",
      images: [
        "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png",
        "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_atras.png",
        "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_delado.png"
      ],
      category: "blusas",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Azul", "Negro", "Plomo"],
      fabric: "Seda francesa",
      colorImages: {
        'Azul': [
          "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_delante.png",
          "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_atras.png",
          "/imagenes/blusas/blusa_seda_francesa/blusa_sedafrancesa_azul_delado.png"
        ],
        'Negro': [
          "/imagenes/blusas/blusa_seda_francesa/negro_adelante.png",
          "/imagenes/blusas/blusa_seda_francesa/negro_atras.png",
          "/imagenes/blusas/blusa_seda_francesa/negro_delado.png"
        ],
        'Plomo': [
          "/imagenes/blusas/blusa_seda_francesa/plomo_adelante.png",
          "/imagenes/blusas/blusa_seda_francesa/plomo_atras.png",
          "/imagenes/blusas/blusa_seda_francesa/plomo_delado.png"
        ]
      }
    }
  ];

  return (
    <ProductsPage 
      products={products}
      title="BLUSAS VERSÁTILES"
      category="blusas"
      filters={{
        availableSizes: [
          { label: 'XS', count: 1 },
          { label: 'S', count: 1 },
          { label: 'M', count: 1 },
          { label: 'L', count: 1 },
        ],
        availableFabrics: [
          { label: 'Seda francesa', count: 1 }
        ]
      }}
    />
  );
};

export default BlusasPage;
