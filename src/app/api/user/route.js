// app/api/user/route.js

import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from Shopify Storefront API
    const userData = await fetchUserDataFromStorefront(token);

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

async function fetchUserDataFromStorefront(token) {
  const storefrontUrl = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

  const query = `
    query getCustomer($token: String!) {
      customer(customerAccessToken: $token) {
        id
        firstName
        lastName
        email
        phone
        addresses(first: 5) {
          edges {
            node {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              country
              zip
              province
              phone
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(storefrontUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables: { token } }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("Shopify Storefront API error:", data.errors);
      return null;
    }

    if (!data.data.customer) {
      return { error: "User not found or unauthorized" };
    }

    const customer = data.data.customer;
    const addresses = customer.addresses.edges.map((edge, index) => ({
      ...edge.node,
      isPrimary: index === 0, // Set the first address as primary (or fetch this from the backend if available)
    }));

    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || "",
      addresses,
    };
  } catch (error) {
    console.error("Error fetching data from Shopify Storefront:", error);
    return { error: "Internal server error" };
  }
}