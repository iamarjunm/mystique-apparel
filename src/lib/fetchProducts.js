// src/lib/fetchProducts.js

export async function fetchProducts() {
  const endpoint = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;
  const query = `
    query {
      products(first: 40) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 2) {
              edges {
                node {
                  src
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error fetching products data:', response.status, errorData);
      return [];
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    const products = data.data.products.edges.map((productEdge) => {
      const product = productEdge.node;

      // Extract prices
      const originalPrice = parseFloat(
        product.variants.edges[0]?.node.compareAtPrice?.amount || 
        product.compareAtPriceRange.minVariantPrice.amount || 
        0
      );
      const discountedPrice = parseFloat(product.priceRange.minVariantPrice.amount);
      const discountPercentage = originalPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

      // Extract images
      const images = product.images.edges.map((edge) => edge.node.src);
      const frontImage = images[0] || 'https://picsum.photos/200/200'; // Fallback if no image
      const backImage = images[1] || frontImage; // Use frontImage as fallback for backImage

      return {
        id: product.id,
        handle: product.handle, // Add handle here
        title: product.title,
        description: product.descriptionHtml,
        price: `${discountedPrice}`, // Remove currency code for Rs
        originalPrice: originalPrice > 0 ? `${originalPrice}` : null, // Remove currency code for Rs
        discountPercentage,
        frontImage, // Correctly assign frontImage
        backImage, // Correctly assign backImage
      };
    });

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}


export async function fetchProductById(id) {
  const endpoint = `${process.env.SHOPIFY_STORE_URL}/api/2024-01/graphql.json`; // Updated API version
  const query = `
      query GetProductById($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
            }
            maxVariantPrice {
              amount
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
            }
          }
          images(first: 10) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
                compareAtPrice {
                  amount
                }
                selectedOptions {
                  name
                  value
                }
                quantityAvailable  
                availableForSale
              }
            }
          }
        }
      }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables: { id } }),
    });

    if (!response.ok) {
      console.error('Error fetching product data:', response.status, await response.text());
      return null;
    }

    const { data, errors } = await response.json();

    if (errors) {
      console.error('GraphQL errors:', errors);
      return null;
    }

    const product = data.product;
    if (!product) {
      console.error('Product not found');
      return null;
    }

    // Extract first variant safely
    const firstVariant = product.variants.edges[0]?.node || {};
    const originalPrice = parseFloat(firstVariant.compareAtPrice?.amount || 0);
    const discountedPrice = parseFloat(product.priceRange.minVariantPrice.amount || 0);

    // Calculate Discount Percentage Safely
    const discountPercentage = (originalPrice && originalPrice > discountedPrice)
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

    // Extract Image URLs
    const images = product.images.edges.map((edge) => edge.node.url);

    // Extract Sizes & Stock
    const sizes = product.variants.edges.map((variantEdge) => {
      const variant = variantEdge.node;
      const sizeOption = variant.selectedOptions.find((option) => option.name.toLowerCase() === "size");
      return {
        size: sizeOption?.value || variant.title, // Fallback to variant title
        available: variant.availableForSale,
        stock: variant.quantityAvailable ?? 0,
      };
    });

    return {
      id: product.id,
      handle: product.handle, // Add handle here
      title: product.title,
      description: product.descriptionHtml,
      price: `${discountedPrice}`,
      originalPrice: originalPrice > 0 ? `${originalPrice}` : null,
      discountPercentage,
      images,
      sizes,
      variants: product.variants.edges.map((variantEdge) => ({
        id: variantEdge.node.id,
        title: variantEdge.node.title,
        price: `${variantEdge.node.price.amount}`,
      })),
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchCollectionByHandle(handle) {
  const endpoint = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

  const query = `
    query getCollection($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        handle
        products(first: 100) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 2) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { handle },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error fetching collection data:', response.status, errorData);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    const collection = data?.data?.collectionByHandle;
    if (!collection) return null;

    const products = collection.products.edges.map(({ node }) => {
      const discountedPrice = parseFloat(node.priceRange.minVariantPrice.amount);
      const originalPriceRaw = node.variants.edges[0]?.node.compareAtPrice?.amount || node.compareAtPriceRange.minVariantPrice?.amount;
      const originalPrice = parseFloat(originalPriceRaw) || 0;

      const discountPercentage = originalPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

      const images = node.images.edges.map((edge) => edge.node.src);
      const frontImage = images[0] || 'https://picsum.photos/200';
      const backImage = images[1] || frontImage;

      return {
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.descriptionHtml,
        price: discountedPrice.toFixed(2),
        originalPrice: originalPrice ? originalPrice.toFixed(2) : null,
        discountPercentage,
        frontImage,
        backImage,
      };
    });

    return {
      collection: {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
      },
      products,
    };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function fetchProductsByCategory(categoryHandle) {
  const endpoint = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

  const query = `
    query getProductsByCategory($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        handle
        products(first: 100) {
          edges {
            node {
              id
              title
              handle
              descriptionHtml
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              compareAtPriceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 2) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { handle: categoryHandle },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error fetching category:', response.status, errorData);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return null;
    }

    const collection = data.data.collectionByHandle;
    if (!collection) return null;

    const products = collection.products.edges.map(({ node: product }) => {
      const originalPrice = parseFloat(
        product.variants.edges[0]?.node.compareAtPrice?.amount ||
        product.compareAtPriceRange.minVariantPrice.amount ||
        0
      );

      const discountedPrice = parseFloat(product.priceRange.minVariantPrice.amount);
      const discountPercentage = originalPrice
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

      const images = product.images.edges.map((edge) => edge.node.src);
      const frontImage = images[0] || 'https://picsum.photos/200/200';
      const backImage = images[1] || frontImage;

      return {
        id: product.id,
        handle: product.handle,
        title: product.title,
        description: product.descriptionHtml,
        price: `${discountedPrice}`,
        originalPrice: originalPrice > 0 ? `${originalPrice}` : null,
        discountPercentage,
        frontImage,
        backImage,
      };
    });

    return {
      collection: {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
      },
      products,
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return null;
  }
}
