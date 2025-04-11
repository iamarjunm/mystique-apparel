import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const { token, addressId } = await request.json();

    console.log("Received delete request:", { token, addressId });

    if (!token || !addressId) {
      console.error("Missing token or addressId");
      return NextResponse.json(
        { message: "Missing token or addressId" },
        { status: 400 }
      );
    }

    const storefrontUrl = `${process.env.SHOPIFY_STORE_URL}/api/2024-01/graphql.json`;

    const mutation = `
      mutation customerAddressDelete($addressId: ID!) {
        customerAddressDelete(customerAccessToken: "${token}", id: $addressId,) {
          deletedCustomerAddressId
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      customerAccessToken: token,
      addressId: addressId,
    };

    console.log("Sending delete mutation to Shopify...");

    const response = await fetch(storefrontUrl, {
      method: "POST", // Shopify API still uses POST for GraphQL
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    if (!response.ok) {
      console.error(`Shopify API responded with status ${response.status}`);
      return NextResponse.json(
        { message: `Shopify API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Shopify API response:", JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error("Shopify Storefront API error:", data.errors);
      return NextResponse.json(
        { message: "Failed to delete address", errors: data.errors },
        { status: 500 }
      );
    }

    if (data.data.customerAddressDelete?.userErrors?.length > 0) {
      console.error("User errors:", data.data.customerAddressDelete.userErrors);
      return NextResponse.json(
        {
          message: "Invalid input data",
          errors: data.data.customerAddressDelete.userErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Address deleted successfully",
        deletedAddressId: data.data.customerAddressDelete.deletedCustomerAddressId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}