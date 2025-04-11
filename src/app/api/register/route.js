// pages/api/register.js

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("Register Request Received");

    const body = await req.text();
    console.log("Request Body (Raw):", body);

    const { firstName, lastName, email, password } = JSON.parse(body);
    console.log("Parsed Request Body:", { firstName, lastName, email, password });

    const shopifyUrl = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

    const query = `
      mutation customerCreate($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
            firstName
            lastName
            email
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
        firstName,
        lastName,
        email,
        password,
        acceptsMarketing: true, // Optional, can be set to true or false
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
    console.log("Shopify Response:", data);

    if (data.errors || data.data?.customerCreate?.customerUserErrors.length > 0) {
      throw new Error(
        JSON.stringify(data.data?.customerCreate?.customerUserErrors || data.errors)
      );
    }

    return NextResponse.json({
      message: "Customer created successfully!",
      customer: data.data.customerCreate.customer,
    });
  } catch (error) {
    console.error("Error Registering Customer:", error.message);
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}
