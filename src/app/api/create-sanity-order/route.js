import { client } from "@/sanity";
import { sendOrderConfirmationEmail } from "@/lib/email";

// Generate shorter order ID (e.g., ORD-A1B2C3D4)
function generateShortOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "ORD-";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function POST(req) {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      cart,
      email,
      shippingAddress,
      shippingOption,
      totalAmount,
      discount,
      paymentMethod = "razorpay",
      advancePaid = 0,
      remainingToPay = 0,
      isFreeOrder = false,
      userId = null,
      customerName = "",
      firebaseUid = null,
    } = await req.json();

    console.log("📝 [CREATE ORDER] Request received:", {
      email,
      firebaseUid,
      cartCount: cart?.length,
      shippingOption,
      totalAmount,
      paymentMethod,
    });

    // Validate required fields
    if (!email || !cart || cart.length === 0) {
      throw new Error("Missing required order information");
    }

    // Generate shorter order number
    const orderNumber = generateShortOrderId();

    // Map cart items to Sanity order items with product references
    const orderItems = cart.map((item) => {
      console.log("📦 [ITEM MAPPING] Processing item:", {
        title: item.title,
        productId: item.productId,
        id: item.id,
        variantId: item.variantId,
      });

      const orderItem = {
        _type: "object",
        _key: `item-${item.variantId || item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productTitle: item.title || "",
        variantSize: item.size || "",
        variantColor: item.color || "",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
      };

      // Use productId (actual Sanity document ID) - try multiple sources
      const productDocId = item.productId || item.id || item.sanityId;
      
      console.log("📦 [ITEM MAPPING] Product ID candidates:", {
        productDocId,
        isValidId: productDocId && /^[a-zA-Z0-9_-]+$/.test(productDocId),
      });
      
      // Add product reference using the actual product document ID
      if (productDocId && /^[a-zA-Z0-9_-]+$/.test(productDocId)) {
        orderItem.product = {
          _type: "reference",
          _ref: productDocId,
        };
        console.log("✅ [ITEM MAPPING] Product reference added:", productDocId);
      } else {
        console.warn("⚠️ [ITEM MAPPING] No valid product reference found for item:", item.title);
      }

      return orderItem;
    });

    console.log("📦 [CREATE ORDER] Items mapped:", {
      count: orderItems.length,
      firstItem: orderItems[0],
    });

    // Build shipping address with proper structure
    const sanityShippingAddress = {
      _type: "object",
      street: `${shippingAddress?.address1 || ""}${
        shippingAddress?.address2 ? ", " + shippingAddress.address2 : ""
      }`.trim(),
      city: shippingAddress?.city || "",
      state: shippingAddress?.province || "",
      postalCode: shippingAddress?.zip || "",
      country: shippingAddress?.country || "India",
    };

    // Calculate pricing - ensure all are numbers
    const subtotal = cart.reduce((sum, item) => {
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;
      return sum + itemPrice * itemQty;
    }, 0);

    const shippingCost = Number(shippingOption?.price) || 0;
    const discountAmount = Number(discount?.amount) || 0;
    const finalTotal = subtotal + shippingCost - discountAmount;

    console.log("💰 [CREATE ORDER] Pricing breakdown:", {
      subtotal,
      shippingCost,
      discountAmount,
      finalTotal,
    });

    // Reduce product stock
    console.log("📉 [STOCK] Updating product stock...");
    for (const item of cart) {
      try {
        // Use productId (actual Sanity document ID) instead of variantId
        const productDocId = item.productId || item.id;
        
        // Only try to update stock if the product ID looks valid
        if (!productDocId || !/^[a-zA-Z0-9_-]+$/.test(productDocId)) {
          console.warn(
            `⚠️ [STOCK] Skipping stock update for ${item.title} - invalid product ID`
          );
          continue;
        }

        const quantity = Number(item.quantity) || 1;
        // Update the product document to reduce inventory
        await client
          .patch(productDocId)
          .dec({ inventory: quantity }) // Decrement inventory field
          .commit();
        console.log(
          `✅ [STOCK] Reduced ${item.title} stock by ${quantity} (Product ID: ${productDocId})`
        );
      } catch (stockError) {
        console.warn(
          `⚠️ [STOCK] Could not update stock for ${item.title}:`,
          stockError.message
        );
        // Don't throw - allow order to be created even if stock update fails
      }
    }

    // Create Sanity order document
    const orderDoc = {
      _type: "order",
      orderNumber,
      userId: firebaseUid || userId || `guest-${email}`,
      customerEmail: email,
      customerName: customerName
        ? customerName
        : (shippingAddress?.firstName || "") +
          " " +
          (shippingAddress?.lastName || ""),
      customerPhone: shippingAddress?.phone || "",
      items: orderItems,
      shippingAddress: sanityShippingAddress,
      subtotal: Number(subtotal),
      shippingCost: Number(shippingCost),
      tax: 0,
      discountCode: discount?.code || null,
      discountAmount: discountAmount || 0,
      total: Number(finalTotal),
      paymentMethod: paymentMethod === "cod" ? "cod" : "razorpay",
      paymentId: razorpayPaymentId || razorpayOrderId || null,
      status:
        isFreeOrder || (paymentMethod === "razorpay" && razorpayPaymentId)
          ? "processing"
          : "pending",
      trackingNumber: null,
      notes: `Payment Method: ${paymentMethod.toUpperCase()}${
        paymentMethod === "cod"
          ? `\nAdvance Paid: ₹${advancePaid}\nRemaining: ₹${remainingToPay}`
          : ""
      }${
        discount
          ? `\nDiscount Code: ${discount.code} (-₹${discountAmount})`
          : ""
      }${isFreeOrder ? "\nFree Order (No Payment Required)" : ""}${
        firebaseUid ? `\nFirebase UID: ${firebaseUid}` : ""
      }`,
      createdAt: new Date().toISOString(),
    };

    console.log("📄 [CREATE ORDER] Document prepared:", {
      orderNumber: orderDoc.orderNumber,
      userId: orderDoc.userId,
      itemCount: orderDoc.items.length,
      total: orderDoc.total,
      shippingCost: orderDoc.shippingCost,
    });

    // Create the order in Sanity
    const createdOrder = await client.create(orderDoc);
    
    console.log("✅ [CREATE ORDER] Order created successfully:", {
      orderId: createdOrder._id,
      orderNumber: createdOrder.orderNumber,
      itemsCount: createdOrder.items?.length || 0,
      firstItem: createdOrder.items?.[0],
    });

    console.log("✅ [CREATE ORDER] Success:", {
      orderId: createdOrder._id,
      orderNumber: createdOrder.orderNumber,
      email: createdOrder.customerEmail,
      userId: createdOrder.userId,
      total: createdOrder.total,
      shippingCost: createdOrder.shippingCost,
    });

    // Send order confirmation email via Resend
    console.log("📧 [EMAIL] Sending order confirmation to:", createdOrder.customerEmail);
    console.log("📧 [EMAIL] Order items for email:", JSON.stringify(orderItems, null, 2));
    try {
      const emailResult = await sendOrderConfirmationEmail({
        email: createdOrder.customerEmail,
        orderId: createdOrder.orderNumber,
        customerName: createdOrder.customerName || createdOrder.customerEmail.split('@')[0],
        customerPhone: createdOrder.customerPhone || '',
        shippingAddress: createdOrder.shippingAddress || null,
        items: orderItems.map((item) => {
          console.log("📧 [EMAIL] Mapping item:", {
            productTitle: item.productTitle,
            variantSize: item.variantSize,
            variantColor: item.variantColor
          });
          return {
            productName: item.productTitle,
            productTitle: item.productTitle,
            size: item.variantSize,
            color: item.variantColor,
            variantSize: item.variantSize,
            variantColor: item.variantColor,
            quantity: item.quantity,
            price: item.price,
          };
        }),
        subtotal: createdOrder.subtotal,
        shippingCost: createdOrder.shippingCost || 0,
        tax: createdOrder.tax || 0,
        discountCode: createdOrder.discountCode || null,
        discountAmount: createdOrder.discountAmount || 0,
        totalAmount: createdOrder.total,
        status: 'confirmed',
      });

      if (emailResult) {
        console.log("✅ [EMAIL] Order confirmation sent successfully");
      } else {
        console.warn("⚠️ [EMAIL] Failed to send order confirmation (Resend returned null)");
      }
    } catch (emailError) {
      console.error("❌ [EMAIL] Exception sending order confirmation:", emailError.message);
      // Continue with order creation even if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: createdOrder.orderNumber,
        sanityId: createdOrder._id,
        message: "Order created successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ [CREATE ORDER] Error:", {
      message: error.message,
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to create order",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
