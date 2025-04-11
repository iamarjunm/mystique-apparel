export const fetchProductWeight = async (shopifyProductId, variantId, defaultWeight = 0.5) => {
  try {
    console.log("Fetching weight for Variant ID:", variantId);

    if (!shopifyProductId || !variantId) {
      console.error("❌ Shopify Product ID and Variant ID are required");
      return defaultWeight;
    }

    const numericProductId = shopifyProductId.match(/\d+/g)?.pop();
    if (!numericProductId) {
      console.error("❌ Could not extract numeric ID from Shopify product ID");
      return defaultWeight;
    }

    const shopifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/shopify-product?productId=${numericProductId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }
    );

    if (!shopifyResponse.ok) {
      const errorData = await shopifyResponse.json().catch(() => ({}));
      console.error(`❌ Shopify API error [${shopifyResponse.status}]:`, errorData.error || 'Unknown error');
      return defaultWeight;
    }

    const { variants } = await shopifyResponse.json();

    if (!variants || variants.length === 0) {
      console.error("❌ No variants found for product");
      return defaultWeight;
    }

    // ✅ Find the matching variant using variantId
    const matchingVariant = variants.find(variant =>
      variant.id.toString().includes(variantId.toString())
    );

    if (!matchingVariant) {
      console.error(`❌ No matching variant found for ID: ${variantId}`);
      return defaultWeight;
    }

    const variantNumericId = matchingVariant.id.toString().match(/\d+/g)?.pop();
    const sku = matchingVariant.sku || variantNumericId;

    if (!sku) {
      console.error("❌ No SKU or variant ID found");
      return defaultWeight;
    }

    const shiprocketResponse = await fetch(
      `https://apiv2.shiprocket.in/v1/external/products?sku=${encodeURIComponent(sku)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SHIPROCKET_API_TOKEN}`,
        },
      }
    );

    if (!shiprocketResponse.ok) {
      console.error("❌ Failed to search Shiprocket products");
      const errorData = await shiprocketResponse.json().catch(() => ({}));
      console.error("Shiprocket API error details:", errorData);
      return defaultWeight;
    }

    const shiprocketData = await shiprocketResponse.json();

    const shiprocketProduct = shiprocketData.data?.find(p =>
      p.sku === sku || p.sku === variantNumericId
    );

    if (!shiprocketProduct) {
      console.error(`❌ Product with SKU/variant ID ${sku} not found in Shiprocket`);
      return defaultWeight;
    }

    const weight = Math.max(parseFloat(shiprocketProduct?.weight) || defaultWeight, 0.1);
    console.log(`✅ Weight for Variant ${variantNumericId} (SKU: ${sku}):`, weight);
    return weight;

  } catch (error) {
    console.error("❌ Exception while fetching product weight:", error);
    return defaultWeight;
  }
};
