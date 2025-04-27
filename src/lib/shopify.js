// src/lib/shopify.js

const domain = process.env.SHOPIFY_STORE_URL || process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL;
const storefrontAccessToken = process.env.SHOPIFY_ACCESS_TOKEN || process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

if (!domain) {
  throw new Error("❌ Missing Shopify store domain in environment variables");
}

if (!storefrontAccessToken && !adminAccessToken) {
  throw new Error("❌ Missing Shopify access tokens (both storefront and admin)");
}

const SHOPIFY_API_VERSION = '2023-07';

/**
 * Helper function to make requests to Shopify APIs
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} body - Request body
 * @param {boolean} isAdmin - Whether to use Admin API
 * @returns {Promise<Object>} - Response data
 */
async function shopifyRequest(endpoint, method = 'GET', body = null, isAdmin = false) {
  const baseUrl = isAdmin 
    ? `${domain}/admin/api/${SHOPIFY_API_VERSION}`
    : `${domain}/api/${SHOPIFY_API_VERSION}`;

  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    ...(isAdmin && { 'X-Shopify-Access-Token': adminAccessToken })
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Shopify API Error (${response.status}): ${errorData.message || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Shopify API request failed (${url}):`, error);
    throw error;
  }
}

// Add this to your shopify.js exports
export async function getShopifyOrder(orderId) {
  try {
    const response = await shopifyRequest(`/orders/${orderId}.json`, 'GET', null, true);
    return response.order;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    throw error;
  }
}

/**
 * Execute GraphQL queries against Shopify Storefront API
 * @param {string} query - GraphQL query
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Response data
 */
export async function shopifyGraphQL(query, variables = {}) {
  const endpoint = '/graphql.json';
  const body = { query, variables };

  try {
    const data = await shopifyRequest(endpoint, 'POST', body);
    
    if (data.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    // Handle checkout-specific errors
    if (data.data?.checkoutCreate?.checkoutUserErrors?.length > 0) {
      const errors = data.data.checkoutCreate.checkoutUserErrors;
      throw new Error(`Checkout Errors: ${errors.map(e => e.message).join(', ')}`);
    }

    return data.data;
  } catch (error) {
    console.error('Shopify GraphQL Error:', error.message);
    throw error;
  }
}

/**
 * Create a new checkout
 * @param {Array} lineItems - Array of line items
 * @param {string} email - Customer email
 * @param {Object} shippingAddress - Shipping address
 * @returns {Promise<Object>} - Checkout object
 */
export async function createCheckout(lineItems, email, shippingAddress) {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
          completedAt
          order {
            id
            name
            orderNumber
          }
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
      lineItems: lineItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        customAttributes: item.customAttributes || []
      })),
      shippingAddress: {
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        country: shippingAddress.country,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        province: shippingAddress.province,
        zip: shippingAddress.zip
      }
    }
  };

  try {
    const data = await shopifyGraphQL(mutation, variables);
    return data.checkoutCreate.checkout;
  } catch (error) {
    console.error('Failed to create checkout:', error);
    throw error;
  }
}

/**
 * Create an order in Shopify (Admin API)
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order
 */
// In your existing shopify.js
export async function createShopifyOrder(orderData) {
  const endpoint = '/orders.json';
  
  const orderPayload = {
    order: {
      email: orderData.email,
      line_items: orderData.lineItems.map(item => ({
        variant_id: extractNumericId(item.variantId),
        quantity: item.quantity,
        ...(item.price && { price: item.price })
      })),
      shipping_address: {
        first_name: orderData.shippingAddress.firstName,
        last_name: orderData.shippingAddress.lastName,
        address1: orderData.shippingAddress.address1,
        address2: orderData.shippingAddress.address2 || '',
        city: orderData.shippingAddress.city,
        province: orderData.shippingAddress.province,
        country: orderData.shippingAddress.country,
        zip: orderData.shippingAddress.zip,
        phone: orderData.shippingAddress.phone,
        ...(orderData.shippingAddress.countryCode && { 
          country_code: orderData.shippingAddress.countryCode 
        })
      },
      shipping_lines: orderData.shippingLines.map(shippingOption => ({
        title: shippingOption.title,
        price: shippingOption.price,  // Ensure this is the correct shipping price
        code: shippingOption.code || 'standard',
        ...(shippingOption.carrierId && { carrier_identifier: shippingOption.carrierId })
      })),
      financial_status: 'paid',  // Payment status is always 'paid'
      note: orderData.note,
      tags: orderData.tags
    }
  };

  try {
    const response = await shopifyRequest(endpoint, 'POST', orderPayload, true);
    return response.order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}


function extractNumericId(gid) {
  if (!gid) throw new Error("Variant ID is required");

  const parts = gid.split('/');
  const id = parts.pop();

  if (!id || isNaN(id)) {
    throw new Error(`Invalid Shopify GID format: ${gid}`);
  }

  return id;
}

/**
 * Update order with fulfillment information
 * @param {string} orderId - Shopify order ID
 * @param {Object} fulfillmentData - Fulfillment data
 * @returns {Promise<Object>} - Updated order
 */
export async function fulfillOrder(orderId, fulfillmentData) {
  const endpoint = `/orders/${orderId}/fulfillments.json`;
  
  try {
    const response = await shopifyRequest(endpoint, 'POST', { fulfillment: fulfillmentData }, true);
    return response.fulfillment;
  } catch (error) {
    console.error(`Failed to fulfill order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Get product details by ID
 * @param {string} productId - Shopify product ID
 * @returns {Promise<Object>} - Product details
 */
export async function getProduct(productId) {
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        description
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyGraphQL(query, { id: `gid://shopify/Product/${productId}` });
    return data.product;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    throw error;
  }
}


/**
 * Execute GraphQL queries against Shopify Admin API
 * @param {string} query - GraphQL query
 * @param {Object} variables - Query variables
 * @returns {Promise<Object>} - Response data
 */
export async function shopifyAdminGraphQL(query, variables = {}) {
  const endpoint = '/graphql.json';
  const body = { query, variables };

  try {
    const data = await shopifyRequest(endpoint, 'POST', body, true); // true = Admin API

    if (data.errors) {
      // Log and throw if there are GraphQL errors
      console.error('GraphQL Admin Errors:', data.errors);
      throw new Error(`GraphQL Admin Errors: ${JSON.stringify(data.errors)}`);
    }

    // Check if there are user errors from the orderCreate mutation
    if (data.data?.orderCreate?.userErrors?.length > 0) {
      const errors = data.data.orderCreate.userErrors;
      console.error('Order Creation Errors:', errors);
      throw new Error(`Order Create Errors: ${errors.map(e => e.message).join(', ')}`);
    }

    // If everything is fine, return the data
    return data.data;
  } catch (error) {
    // Catch both GraphQL and network-related errors
    if (error.name === 'TypeError' && error.message.includes('fetch failed')) {
      console.error('Network error during GraphQL request:', error);
    } else {
      console.error('Shopify Admin GraphQL Error:', error.message);
    }
    throw new Error('An error occurred while processing the GraphQL request.');
  }
}



/**
 * Create an order using Shopify Admin GraphQL API
 * @param {Object} orderInput - Order input object
 * @param {Object} options - Optional order creation options
 * @returns {Promise<Object>} - Created order
 */
export async function createAdminOrder(orderInput, options = {}) {
  const mutation = `
    mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
      orderCreate(order: $order, options: $options) {
        userErrors {
          field
          message
        }
        order {
          id
          name
          totalTaxSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 5) {
            nodes {
              id
              title
              quantity
              variant {
                id
              }
              taxLines {
                title
                rate
                priceSet {
                  shopMoney {
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

  const variables = {
    order: orderInput,
    options: Object.keys(options).length > 0 ? options : undefined,
  };

  try {
    const data = await shopifyAdminGraphQL(mutation, variables);
    return data.orderCreate;
  } catch (error) {
    console.error('Failed to create admin order:', error);
    throw error;
  }
}

// Add these functions to your shopify.js exports

/**
 * Get all orders for a customer by email
 * @param {string} email - Customer email
 * @param {number} [limit=10] - Number of orders to fetch
 * @returns {Promise<Array>} - Array of orders
 */
export async function getCustomerOrders(email, limit = 10) {
  try {
    const response = await shopifyRequest(
      `/orders.json?email=${encodeURIComponent(email)}&limit=${limit}&status=any`, 
      'GET', 
      null, 
      true
    );
    return response.orders || [];
  } catch (error) {
    console.error('Failed to fetch customer orders:', error);
    throw error;
  }
}

/**
 * Get order details by ID
 * @param {string} orderId - Shopify order ID
 * @returns {Promise<Object>} - Order details
 */
export async function getOrderDetails(orderId) {
  try {
    const response = await shopifyRequest(
      `/orders/${orderId}.json`, 
      'GET', 
      null, 
      true
    );
    return response.order || null;
  } catch (error) {
    console.error(`Failed to fetch order ${orderId}:`, error);
    throw error;
  }
}