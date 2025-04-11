

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Login Request Received");

    // Log the request body
    const body = await req.text();
    console.log("Request Body (Raw):", body);

    // Parse the request body as JSON
    const { email, password } = JSON.parse(body);
    console.log("Parsed Request Body:", { email, password });

    const shopifyUrl = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

    const query = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email,
        password,
      },
    };

    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    console.log("Shopify Login Response:", data);

    if (data.errors || data.data?.customerAccessTokenCreate?.customerUserErrors.length > 0) {
      throw new Error(
        JSON.stringify(data.data?.customerAccessTokenCreate?.customerUserErrors || data.errors)
      );
    }

    return NextResponse.json({
      message: "Login successful!",
      token: data.data.customerAccessTokenCreate.customerAccessToken.accessToken,
      expiresAt: data.data.customerAccessTokenCreate.customerAccessToken.expiresAt,
    });
  } catch (error) {
    console.error("Error Logging In:", error.message);
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
