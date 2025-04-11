import { fetchProductWeight } from "@/lib/fetchProductWeight"; // Adjust the path as needed

export async function POST(req) {
  try {
    const { pickup_postcode, delivery_postcode, shopifyProductId, variantId } = await req.json();

    // Validate required parameters
    if (!pickup_postcode || !delivery_postcode || !shopifyProductId || !variantId) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: pickup_postcode, delivery_postcode, shopifyProductId, or variantId",
        }),
        { status: 400 }
      );
    }

    // Validate postcodes
    const postcodeRegex = /^\d{6}$/;
    if (!postcodeRegex.test(pickup_postcode) || !postcodeRegex.test(delivery_postcode)) {
      return new Response(
        JSON.stringify({ error: "Postcodes must be 6-digit numbers" }),
        { status: 400 }
      );
    }

    // ✅ Fetch weight using product + variant ID
    const weight = await fetchProductWeight(shopifyProductId, variantId);

    // Validate weight
    if (isNaN(weight) || weight <= 0) {
      return new Response(
        JSON.stringify({ error: "Weight must be a valid number greater than 0" }),
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SHIPROCKET_API_TOKEN) {
      console.error("Shiprocket API token is missing");
      return new Response(
        JSON.stringify({ error: "Internal server error: Missing Shiprocket API token" }),
        { status: 500 }
      );
    }

    // Fetch shipping rates from Shiprocket
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/courier/serviceability/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SHIPROCKET_API_TOKEN}`,
      },
      body: JSON.stringify({
        pickup_postcode,
        delivery_postcode,
        cod: 0,
        weight,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Shiprocket API error:", data.message || "Unknown error");
      return new Response(
        JSON.stringify({ error: data.message || "Failed to fetch shipping rates from Shiprocket" }),
        { status: response.status }
      );
    }

    const shippingRates = data.data?.available_courier_companies || [];

    const formattedRates = shippingRates.map((rate) => ({
      id: rate.courier_company_id,
      title: rate.courier_name,
      price: `₹${rate.rate}`,
      deliveryTime: rate.etd || "N/A",
    }));

    return new Response(JSON.stringify(formattedRates), { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching shipping rates:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error: Failed to fetch shipping rates" }),
      { status: 500 }
    );
  }
}
