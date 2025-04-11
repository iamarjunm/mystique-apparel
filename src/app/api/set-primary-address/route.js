import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { token, addressId } = await request.json();

    const storefrontUrl = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

    const mutation = `
      mutation customerDefaultAddressUpdate($addressId: ID!) {
        customerDefaultAddressUpdate(
          customerAccessToken: "${token}"
          addressId: $addressId
        ) {
          customer {
            defaultAddress {
              id
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await fetch(storefrontUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { addressId },
      }),
    });

    const data = await response.json();

    if (data.errors || data.data.customerDefaultAddressUpdate.userErrors.length > 0) {
      return NextResponse.json(
        { message: "Failed to set primary address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Primary address updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
