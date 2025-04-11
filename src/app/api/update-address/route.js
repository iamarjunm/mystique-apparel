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

    // Extract address data excluding isPrimary flag since it's not part of MailingAddressInput
    const { id, isPrimary, ...addressData } = address;
    
    // If this is being set as primary, we need to update all other addresses
    if (isPrimary) {
      // First get all customer addresses
      const getAddressesQuery = `
        query {
          customer(customerAccessToken: "${token}") {
            addresses(first: 10) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `;
      
      const addressesResponse = await fetch(storefrontUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: getAddressesQuery }),
      });
      
      const addressesData = await addressesResponse.json();
      const addresses = addressesData.data?.customer?.addresses?.edges || [];
      
      // Set all other addresses to not primary
      for (const addr of addresses) {
        if (addr.node.id !== addressId) {
          const updateMutation = `
            mutation {
              customerAddressUpdate(
                customerAccessToken: "${token}",
                id: "${addr.node.id}",
                address: { isPrimary: false }
              ) {
                customerAddress {
                  id
                }
              }
            }
          `;
          
          await fetch(storefrontUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
            },
            body: JSON.stringify({ query: updateMutation }),
          });
        }
      }
    }

    let mutation;
    if (addressId) {
      // Update an existing address
      mutation = `
        mutation customerAddressUpdate($addressId: ID!, $address: MailingAddressInput!) {
          customerAddressUpdate(customerAccessToken: "${token}", id: $addressId, address: $address) {
            customerAddress {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              country
              province
              zip
              phone
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
    } else {
      // Create a new address
      mutation = `
        mutation customerAddressCreate($address: MailingAddressInput!) {
          customerAddressCreate(customerAccessToken: "${token}", address: $address) {
            customerAddress {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              country
              province
              zip
              phone
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
    }

    console.log("Sending mutation to Shopify:", mutation);

    const variables = addressId
      ? { customerAccessToken: token, addressId, address: addressData }
      : { customerAccessToken: token, address: addressData };

    let data;
    try {
      const response = await fetch(storefrontUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Shopify API request failed:", {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Shopify API request failed with status ${response.status}`);
      }

      data = await response.json();
      console.log("Shopify API response:", data);

      if (data.errors) {
        console.error("Shopify Storefront API error:", data.errors);
        return NextResponse.json(
          { 
            message: "Failed to update/create address",
            errors: data.errors,
            userErrors: data.data?.customerAddressUpdate?.userErrors || 
                      data.data?.customerAddressCreate?.userErrors || []
          },
          { status: 500 }
        );
      }

      if (data.data.customerAddressUpdate?.userErrors?.length > 0 || 
          data.data.customerAddressCreate?.userErrors?.length > 0) {
        console.error("User errors:", 
          data.data.customerAddressUpdate?.userErrors || 
          data.data.customerAddressCreate?.userErrors);
        return NextResponse.json(
          { 
            message: "Invalid input data", 
            errors: data.data.customerAddressUpdate?.userErrors || 
                   data.data.customerAddressCreate?.userErrors 
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Failed to communicate with Shopify API:", error);
      return NextResponse.json(
        { 
          message: "Failed to communicate with Shopify API",
          error: error.message 
        },
        { status: 500 }
      );
    }

    // Get the updated address from response
    const updatedAddress = data.data.customerAddressUpdate?.customerAddress || 
                         data.data.customerAddressCreate?.customerAddress;
    
    // If this was set as primary, we need to update the address to mark it as primary
    if (isPrimary) {
      const setPrimaryMutation = `
        mutation {
          customerDefaultAddressUpdate(
            customerAccessToken: "${token}",
            addressId: "${updatedAddress.id}"
          ) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      try {
        await fetch(storefrontUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          },
          body: JSON.stringify({ query: setPrimaryMutation }),
        });
      } catch (error) {
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