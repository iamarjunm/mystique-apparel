// src/lib/shopify.js

const domain = process.env.SHOPIFY_STORE_URL;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

if (!domain || !accessToken) {
  throw new Error("❌ Missing Shopify environment variables! Check your .env.local file.");
}

async function shopifyFetch(query, variables = {}) {
  const url = `https://${domain}/api/2023-04/graphql.json`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`❌ Shopify API Error: ${errorText}`);
    }

    const { data, errors } = await res.json();

    if (errors) {
      throw new Error(`❌ GraphQL Errors: ${JSON.stringify(errors)}`);
    }

    if (data.checkoutCreate?.checkoutUserErrors?.length > 0) {
      throw new Error(
        `❌ Checkout User Errors: ${JSON.stringify(data.checkoutCreate.checkoutUserErrors)}`
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch failed:", error.message);
    throw new Error(`Fetch failed: ${error.message}`);
  }
}

export async function createCheckout(lineItems, email, shippingAddress) {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      email,
      lineItems,
      shippingAddress,
    },
  };

  console.log("Shopify API Request:", { query: mutation, variables });

  try {
    const data = await shopifyFetch(mutation, variables);
    console.log("Shopify API Response:", data);
    return data.checkoutCreate.checkout;
  } catch (error) {
    console.error("Error in createCheckout:", error.message);
    throw error;
  }
}