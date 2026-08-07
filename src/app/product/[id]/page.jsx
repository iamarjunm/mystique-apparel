import React from "react";
import ProductClient from "./ProductClient";
import { fetchProductById } from "@/lib/fetchProducts";

export async function generateMetadata({ params }) {
  // Await the params in Next.js 15+ if needed, but standard params.id works
  const { id } = params;
  
  try {
    const product = await fetchProductById(id);

    if (!product) {
      return {
        title: "Product Not Found",
        description: "This product could not be found.",
      };
    }

    const title = product.title;
    const description = product.description 
      ? product.description.substring(0, 160) // SEO description limit
      : `Buy ${product.title} at Mystique Apparel. Premium streetwear and dark fashion.`;
      
    // Handle images safely
    const ogImage = product.frontImage || (product.images && product.images[0]) || "/logo.png";

    return {
      title: title,
      description: description,
      openGraph: {
        title: `${title} | Mystique Apparel`,
        description: description,
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
        description: description,
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
  const { id } = params;
  const product = await fetchProductById(id);

  if (!product) {
    return <ProductClient id={id} />;
  }

  // Construct JSON-LD Schema for Google Rich Snippets
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
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient id={id} />
    </>
  );
}
