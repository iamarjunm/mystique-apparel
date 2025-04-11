import { NextResponse } from "next/server";

export async function POST(req) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { currentPassword, newPassword } = await req.json();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Validate the current password and update to the new password
  // This logic depends on your backend or Shopify Storefront API
  try {
    // Example: Call Shopify Storefront API to update the password
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
            password: newPassword,
          },
          customerAccessToken: token,
        },
      }),
    });

    const data = await response.json();

    if (data.errors || data.data.customerUpdate.customerUserErrors.length > 0) {
      return NextResponse.json({ message: "Failed to update password" }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}