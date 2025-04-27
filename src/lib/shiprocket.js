export const createShiprocketOrder = async (orderData) => {
    try {
      // First get authentication token
      const authResponse = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD
        })
      });
  
      const authData = await authResponse.json();
      
      if (!authData.token) {
        return { success: false, error: "Shiprocket authentication failed" };
      }
  
      // Create shipment
      const shipmentResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          order_id: orderData.orderId,
          order_date: new Date().toISOString(),
          pickup_location: "Primary",
          channel_id: "",
          comment: "",
          billing_customer_name: orderData.shippingAddress.firstName + " " + orderData.shippingAddress.lastName,
          billing_last_name: orderData.shippingAddress.lastName,
          billing_address: orderData.shippingAddress.address1,
          billing_address_2: orderData.shippingAddress.address2 || "",
          billing_city: orderData.shippingAddress.city,
          billing_pincode: orderData.shippingAddress.zip,
          billing_state: orderData.shippingAddress.province,
          billing_country: orderData.shippingAddress.country,
          billing_email: orderData.customerInfo.email,
          billing_phone: orderData.shippingAddress.phone,
          shipping_is_billing: true,
          payment_method: orderData.paymentMethod,
          shipping_charges: 0,
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: 0,
          sub_total: orderData.totalAmount,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5,
          items: orderData.items.map(item => ({
            name: item.title,
            sku: item.sku || item.variantId,
            units: item.quantity,
            selling_price: item.price,
            discount: "",
            tax: "",
            hsn: 0
          }))
        })
      });
  
      const shipmentData = await shipmentResponse.json();
      
      if (shipmentData.status !== "NEW") {
        return { success: false, error: shipmentData.message || "Shiprocket order creation failed" };
      }
  
      return { 
        success: true, 
        trackingId: shipmentData.shipment_id,
        awbNumber: shipmentData.awb_number
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };