import { NextResponse } from "next/server";

export async function POST(req) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { firstName, lastName } = await req.json();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Update the name in your backend or Shopify Storefront API
  try {
    // Example: Call Shopify Storefront API to update the name
    const response = await fetch(`${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: `
          mutation customerUpdate($customer: CustomerUpdateInput!, $customerAccessToken: String!) {
            customerUpdate(customer: $customer, customerAccessToken: $customerAccessToken) {
              customer {
                id
                firstName
                lastName
              }
              customerUserErrors {
                code
                message
              }
            }
          }
        `,
        variables: {
          customer: {
            firstName,
            lastName,
          },
          customerAccessToken: token,
        },
      }),
    });

    const data = await response.json();

    if (data.errors || data.data.customerUpdate.customerUserErrors.length > 0) {
      return NextResponse.json({ message: "Failed to update name" }, { status: 400 });
    }

    return NextResponse.json({ message: "Name updated successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}