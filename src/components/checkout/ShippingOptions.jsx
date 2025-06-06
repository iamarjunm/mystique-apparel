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

        const pin = shippingAddress?.zip;

        // Condition for *not* fetching: pin is missing/invalid OR cart is empty
        if (!pin || !/^\d{6}$/.test(pin)) {
          // No need for a loud error, just a guiding message
          setError("Please enter a valid 6-digit Indian PIN code for shipping estimates.");
          setShippingRates([]); // Ensure no rates are shown
          return;
        }

        if (!cart || cart.length === 0) {
          setError("Your cart is empty. Add items to calculate shipping.");
          setShippingRates([]);
          return;
        }
        
        // --- IMPORTANT: Only proceed if validation passes ---

        // Fetch weights for all cart items
        // ... (rest of your fetchProductWeight and totalWeight calculation) ...
        const cartWithWeights = await Promise.all(
          cart.map(async (item) => {
            const variantId = item.variantId.match(/\d+$/)?.[0];
            // console.log(`Fetching weight for product ${item.id}, variant ${variantId}`); // Keep for debug

            const weight = await fetchProductWeight(
              item.id,
              variantId
            );
            return { ...item, weight };
          })
        );

        const totalWeight = cartWithWeights.reduce(
          (sum, item) => sum + (item.weight || 0) * item.quantity, // Handle case where weight might be undefined
          0
        );
        
        if (totalWeight <= 0) {
          setError("Cart items must have valid weight to calculate shipping.");
          setShippingRates([]);
          return;
        }


        // Fetch Shiprocket shipping rates
        // ... (rest of your Shiprocket API call and response processing) ...
        const params = new URLSearchParams({
          pickup_postcode: PICKUP_POSTCODE,
          delivery_postcode: pin,
          cod: 0,
          weight: totalWeight,
        });

        // console.log('Shiprocket API params:', params.toString()); // Keep for debug

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

        // console.log('Shiprocket API response status:', response.status); // Keep for debug
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          // console.error('Shiprocket API error:', errorData); // Keep for debug
          throw new Error(errorData.message || "Failed to fetch shipping rates. Please try again.");
        }

        const data = await response.json();
        
        if (!data?.data?.available_courier_companies || data.data.available_courier_companies.length === 0) {
          setError("No shipping options available for this PIN code. Please check your address or contact support.");
          setShippingRates([]);
          return;
        }

        const rates = data.data.available_courier_companies.map(company => {
          const priceValue = company.estimated_price || company.rate;
          return {
            id: company.courier_company_id.toString(),
            title: company.courier_name,
            price: priceValue ? `₹${priceValue.toFixed(2)}` : 'Price not available', // Format to 2 decimal places
            deliveryTime: company.estimated_delivery_days 
              ? `${company.estimated_delivery_days} business days`
              : company.etd || "3-5 business days",
          };
        });

        setShippingRates(rates);
        // Automatically select the first rate if none is selected
        if (!selectedShippingRate && rates.length > 0) {
            setSelectedShippingRate(rates[0]);
        }
      } catch (err) {
        console.error("Shipping rates fetch error:", err);
        setError(err.message || "An unexpected error occurred while fetching shipping rates.");
      } finally {
        setLoading(false);
        // console.log('Finished shipping rates fetch attempt'); // Keep for debug
      }
    };

    // Only fetch if zip is valid AND cart has items
    const hasValidZip = shippingAddress?.zip && /^\d{6}$/.test(shippingAddress.zip);
    const hasCartItems = cart?.length > 0;

    if (hasValidZip && hasCartItems) {
      // console.log('Conditions met - fetching shipping rates'); // Keep for debug
      fetchShippingRates();
    } else {
      // console.log('Conditions not met for fetching shipping rates:', { hasValidZip, hasCartItems }); // Keep for debug
      setShippingRates([]); // Clear rates if conditions not met
      setSelectedShippingRate(null); // Clear selected rate
      if (!hasValidZip) {
        setError("Please enter a valid 6-digit Indian PIN code to view shipping options.");
      } else if (!hasCartItems) {
        setError("Your cart is empty. Add items to calculate shipping.");
      } else {
         setError(null); // Clear error if conditions are just not met yet (e.g., waiting for user input)
      }
    }
  }, [shippingAddress?.zip, cart, setShippingRates, setSelectedShippingRate]);

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
  type="button" // Add this line
  onClick={(e) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event bubbling
    setSelectedShippingRate(rate);
  }}
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