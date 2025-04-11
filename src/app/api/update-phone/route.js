import { NextResponse } from "next/server";

export async function POST(req) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  const { phone, countryCode } = await req.json();

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formattedPhone = countryCode ? `${countryCode}${phone}` : phone;
    
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
                phone
              }
              customerUserErrors {
                code
                message
                field
              }
            }
          }
        `,
        variables: {
          customer: {
            phone: formattedPhone,
          },
          customerAccessToken: token,
        },
      }),
    });

    const data = await response.json();

    if (data.errors?.length > 0 || data.data?.customerUpdate?.customerUserErrors?.length > 0) {
      const errors = data.errors || data.data.customerUpdate.customerUserErrors;
      return NextResponse.json({ 
        message: "Failed to update phone",
        errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Phone updated successfully",
      phone: formattedPhone,
      countryCode
    });
  } catch (error) {
    return NextResponse.json({ 
      message: "Internal server error",
      error: error.message 
    }, { status: 500 });
  }
}
