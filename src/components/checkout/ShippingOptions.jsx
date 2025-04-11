import React, { useEffect, useState } from "react";
import { fetchProductWeight } from "src/lib/fetchProductWeight";

const ShippingOptions = ({
  shippingRates,
  setShippingRates,
  selectedShippingRate,
  setSelectedShippingRate,
  shippingAddress,
  cart,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const PICKUP_POSTCODE = "201306"; // Your store's fixed pickup code (India)
  const COUNTRY = "India"; // Locking country to India

  useEffect(() => {
    const fetchShippingRates = async () => {
      try {
        setLoading(true);
        setError(null);
        setShippingRates([]); // Clear previous rates

        // Validation: Must be a 6-digit Indian PIN
        const pin = shippingAddress?.zip;
        
        if (!pin || !/^\d{6}$/.test(pin)) {
          const errorMsg = "Please provide a valid 6-digit Indian PIN code.";
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // Don't proceed if cart is empty
        if (!cart || cart.length === 0) {
          const errorMsg = "Your cart is empty.";
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // Fetch weights for all cart items
        const cartWithWeights = await Promise.all(
          cart.map(async (item) => {
            const variantId = item.variantId.match(/\d+$/)?.[0];
            console.log(`Fetching weight for product ${item.id}, variant ${variantId}`);
            
            const weight = await fetchProductWeight(
              item.id,
              variantId
            );
            
            return { ...item, weight };
          })
        );

        const totalWeight = cartWithWeights.reduce(
          (sum, item) => sum + item.weight * item.quantity,
          0
        );
        

        if (totalWeight <= 0) {
          const errorMsg = "Cart items must have valid weight to calculate shipping.";
          console.error(errorMsg);
          setError(errorMsg);
          return;
        }

        // Fetch Shiprocket shipping rates
        const params = new URLSearchParams({
          pickup_postcode: PICKUP_POSTCODE,
          delivery_postcode: pin,
          cod: 0,
          weight: totalWeight,
        });

        console.log('Shiprocket API params:', params.toString());
        
        const response = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/serviceability?${params}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SHIPROCKET_API_TOKEN}`,
            },
          }
        );

        console.log('Shiprocket API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Shiprocket API error:', errorData);
          throw new Error(errorData.message || "Failed to fetch shipping rates.");
        }

        const data = await response.json();
        
        // Check if data has the expected structure
        if (!data?.data?.available_courier_companies) {
          console.error('Unexpected Shiprocket response structure:', data);
          throw new Error("No shipping options available for this location.");
        }

        // Log each company's data before transformation
        data.data.available_courier_companies.forEach(company => {
          console.log(`Company: ${company.courier_name}`, {
            estimated_price: company.estimated_price,
            rate: company.rate,
            etd: company.etd,
            estimated_delivery_days: company.estimated_delivery_days
          });
        });

        // Transform the response into a more usable format
        const rates = data.data.available_courier_companies.map(company => {
          // Check which price field is available
          const priceValue = company.estimated_price || company.rate;
          console.log(`Processing ${company.courier_name}:`, {
            priceValue,
            estimated_price: company.estimated_price,
            rate: company.rate
          });
          
          return {
            id: company.courier_company_id.toString(),
            title: company.courier_name,
            price: priceValue ? `₹${priceValue}` : 'Price not available',
            deliveryTime: company.estimated_delivery_days 
              ? `${company.estimated_delivery_days} business days`
              : company.etd || "3-5 business days",
          };
        });

        console.log('Formatted shipping rates:', rates);
        setShippingRates(rates);
      } catch (err) {
        console.error("Shipping error:", err);
        setError(err.message || "Error fetching shipping rates.");
      } finally {
        setLoading(false);
        console.log('Finished shipping rates fetch attempt');
      }
    };

    if (shippingAddress?.zip && cart?.length > 0) {
      console.log('Conditions met - fetching shipping rates');
      fetchShippingRates();
    } else {
      console.log('Conditions not met for fetching shipping rates:', {
        hasZip: !!shippingAddress?.zip,
        hasCartItems: cart?.length > 0
      });
    }
  }, [shippingAddress, cart, setShippingRates]);

  // Rest of the component remains the same...
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Domestic Shipping Options</h2>

      {loading && <p>Loading shipping rates within India...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && shippingRates?.length > 0 ? (
        <div className="space-y-4">
          {shippingRates.map((rate) => (
            <div
              key={rate.id}
              className={`p-4 border rounded ${
                selectedShippingRate?.id === rate.id
                  ? "border-green-500 bg-gray-800"
                  : "border-gray-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{rate.title}</p>
                  <p className="text-sm text-gray-400">
                    {rate.deliveryTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg">{rate.price}</p>
                  <button
                    onClick={() => setSelectedShippingRate(rate)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {selectedShippingRate?.id === rate.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && !error && (
        <p className="text-gray-400">Enter a valid Indian PIN code to view shipping options.</p>
      )}
    </div>
  );
};

export default ShippingOptions;