import React from "react";
import ProductClient from "./ProductClient";
import { fetchProductById } from "@/lib/fetchProducts";

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const product = await fetchProductById(id);

    if (!product) {
      return {
        title: "Piece Not Found",
        description: "This garment could not be found in the Mystique archive.",
      };
    }

    const title = product.title;
    const description = product.description
      ? product.description.substring(0, 160)
      : `Discover ${product.title} at Mystique Apparel. Heavyweight 240 GSM dark streetwear crafted in India.`;

    const ogImage = product.frontImage || (product.images && product.images[0]) || "/tshirt.jpg";

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Mystique Apparel`,
        description,
        url: `https://mystiqueapparel.in/product/${id}`,
        siteName: "Mystique Apparel",
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Mystique Apparel`,
        description,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error("Error generating metadata for product:", error);
    return {
      title: "Product Details",
    };
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  let product = null;

  try {
    product = await fetchProductById(id);
  } catch (error) {
    console.error("Error fetching product on server:", error);
  }

  if (!product) {
    return <ProductClient id={id} initialProduct={null} />;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.frontImage || (product.images && product.images[0]),
    description: product.description,
    sku: product.slug || id,
    brand: {
      "@type": "Brand",
      name: "Mystique Apparel",
    },
    offers: {
      "@type": "Offer",
      url: `https://mystiqueapparel.in/product/${product.slug || id}`,
      priceCurrency: "INR",
      price: parseFloat(product.price),
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient id={id} initialProduct={product} />
    </>
  );
}
