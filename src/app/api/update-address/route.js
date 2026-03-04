import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { token, addressId, address } = await request.json();

    console.log("Received request with data:", { token, addressId, address });

    if (!token || !address) {
      console.error("Missing token or address");
      return NextResponse.json(
        { message: "Missing token or address" },
        { status: 400 }
      );
    }

    const storefrontUrl = `${process.env.SHOPIFY_STORE_URL}/api/2023-01/graphql.json`;

    import { NextResponse } from "next/server";

    export async function POST() {
      return NextResponse.json(
        { message: "Shopify disabled" },
        { status: 410 }
      );
    }
        console.error("Failed to set address as primary:", error);
        // Continue anyway since the address was updated/created successfully
      }
    }

    return NextResponse.json(
      {
        message: addressId ? "Address updated successfully" : "Address created successfully",
        updatedAddress: {
          ...updatedAddress,
          isPrimary // Include the isPrimary flag in response
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating/creating address:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}