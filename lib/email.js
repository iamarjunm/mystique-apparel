import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

/**
 * Send order confirmation email
 * @param {Object} orderData - Order information
 * @param {string} orderData.email - Customer email
 * @param {string} orderData.orderId - Order ID
 * @param {string} orderData.customerName - Customer name
 * @param {Array} orderData.items - Order items
 * @param {number} orderData.totalAmount - Total amount
 * @param {string} orderData.status - Order status
 */
export async function sendOrderConfirmationEmail(orderData) {
  try {
    const {
      email,
      orderId,
      customerName,
      items = [],
      totalAmount,
      status = 'confirmed',
    } = orderData;

    if (!email) {
      console.error('[RESEND] Missing email address for order confirmation');
      return null;
    }

    // Format items for email
    const itemsHTML = items
      .map(
        (item) =>
          `<tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; text-align: left;">${item.productName || 'Product'}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 8px; text-align: right;">₹${(item.price || 0).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 32px; margin-bottom: 10px; }
            .header p { font-size: 16px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333; font-size: 22px; margin-bottom: 20px; }
            .greeting { font-size: 16px; margin-bottom: 25px; }
            .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
            .order-details p { margin: 8px 0; font-size: 15px; }
            .order-id { font-size: 18px; font-weight: bold; color: #667eea; }
            .status-badge { display: inline-block; padding: 8px 16px; background: #4CAF50; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            .items-table th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; color: #333; }
            .items-table td { padding: 15px 12px; border-bottom: 1px solid #e0e0e0; }
            .item-name { font-weight: 600; color: #333; }
            .item-details { font-size: 13px; color: #666; margin-top: 4px; }
            .item-qty { text-align: center; }
            .item-price { text-align: right; font-weight: 600; color: #333; }
            .summary-table { margin: 25px 0; }
            .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
            .summary-row.total { border-top: 2px solid #667eea; border-bottom: none; padding: 15px 0; font-size: 18px; font-weight: bold; color: #667eea; }
            .shipping-info { background: #f0f7ff; padding: 15px; border-radius: 8px; margin: 25px 0; font-size: 14px; }
            .shipping-info h3 { color: #667eea; font-size: 14px; margin-bottom: 10px; font-weight: 600; }
            .section-title { color: #333; font-size: 16px; font-weight: 600; margin-top: 30px; margin-bottom: 15px; }
            .benefits { list-style: none; }
            .benefits li { padding: 10px 0; padding-left: 30px; position: relative; font-size: 14px; color: #666; }
            .benefits li:before { content: "✓"; position: absolute; left: 0; color: #4CAF50; font-weight: bold; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; margin-top: 20px; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0; }
            .footer p { font-size: 13px; color: #666; margin: 8px 0; }
            .footer-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
            .support { background: #fff8e1; padding: 15px; border-radius: 8px; margin-top: 25px; font-size: 13px; color: #666; }
            .support strong { color: #333; }
            @media (max-width: 600px) {
              .content { padding: 20px 15px; }
              .items-table { font-size: 13px; }
              .header h1 { font-size: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="wrapper">
              <!-- Header -->
              <div class="header">
                <h1>🎉 Order Confirmed!</h1>
                <p>Thank you for your purchase, ${customerName}!</p>
              </div>
              
              <!-- Content -->
              <div class="content">
                <p class="greeting">Hi ${customerName},</p>
                
                <p>We're thrilled to receive your order! Your purchase has been confirmed and is now being prepared for shipment. This is the beginning of an exciting journey with Mystique Apparel.</p>
                
                <!-- Order Details -->
                <div class="order-details">
                  <p class="order-id">Order #${orderId}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}</p>
                  <span class="status-badge">${status.toUpperCase()}</span>
                </div>
                
                <!-- Order Items -->
                <h2 style="margin-top: 30px; margin-bottom: 20px; color: #333; font-size: 18px;">Order Summary</h2>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Product</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHTML}
                  </tbody>
                </table>
                
                <!-- Price Summary -->
                <div class="summary-table">
                  <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₹${items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                  <div class="summary-row">
                    <span>Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total Amount:</span>
                    <span>₹${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <!-- Shipping Info -->
                <div class="shipping-info">
                  <h3>📦 What's Next?</h3>
                  <p>Your order is being carefully prepared for shipment. We will send you a tracking number via email as soon as your package ships, allowing you to monitor its journey in real-time.</p>
                </div>
                
                <!-- Why Mystique -->
                <h3 class="section-title">✨ Why Choose Mystique Apparel?</h3>
                <ul class="benefits">
                  <li>Premium quality fabrics sourced responsibly</li>
                  <li>Sustainable and eco-conscious manufacturing</li>
                  <li>Expert craftsmanship in every stitch</li>
                  <li>30-day hassle-free returns policy</li>
                  <li>Fast and reliable shipping across India</li>
                </ul>
                
                <!-- Support -->
                <div class="support">
                  <strong>Need Help?</strong> Our customer support team is available 24/7. Reach out to us at <a href="mailto:apparelmystique1@gmail.com" style="color: #667eea; text-decoration: none;">apparelmystique1@gmail.com</a> or visit our <a href="https://www.mystiqueapparel.in/contact" style="color: #667eea; text-decoration: none;">contact page</a>.
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 15px;">Thank you for supporting Mystique Apparel. We're committed to delivering exceptional fashion and service. 💜</p>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <p><strong>Mystique Apparel</strong></p>
                <p>Premium Sustainable Fashion</p>
                <p style="margin-top: 15px; color: #999;">
                  <a href="https://www.mystiqueapparel.in" style="color: #667eea; text-decoration: none;">Website</a> | 
                  <a href="https://www.instagram.com/mystique_.apparel/" style="color: #667eea; text-decoration: none;">Instagram</a> | 
                  <a href="mailto:apparelmystique1@gmail.com" style="color: #667eea; text-decoration: none;">Email</a>
                </p>
                <p style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} Mystique Apparel. All rights reserved.<br>Crafted with precision. Designed for you.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('[RESEND] Sending order confirmation email to:', email);

    const response = await resend.emails.send({
      from: 'orders@mystiqueapparel.in',
      to: email,
      subject: `Order Confirmed - #${orderId}`,
      html,
    });

    if (response.error) {
      console.error('[RESEND] Email send error:', response.error);
      return null;
    }

    console.log('[RESEND] ✅ Order confirmation email sent:', response.id);
    return response;
  } catch (error) {
    console.error('[RESEND] Exception sending order email:', error.message);
    return null;
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(orderData) {
  try {
    const { email, orderId, customerName, status, trackingUrl } = orderData;

    if (!email) {
      console.error('[RESEND] Missing email for status update');
      return null;
    }

    const statusMessages = {
      shipped: 'Your order has been shipped!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.',
      refunded: 'Your refund has been processed.',
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; }
            .status-banner { background: #4CAF50; color: white; padding: 15px; border-radius: 4px; text-align: center; font-weight: bold; margin: 20px 0; }
            .tracking-btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
            .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Order Update</h1>
            </div>
            
            <div class="content">
              <p>Hi ${customerName},</p>
              
              <div class="status-banner">
                ${statusMessages[status] || `Your order status: ${status.toUpperCase()}`}
              </div>
              
              <p><strong>Order ID:</strong> #${orderId}</p>
              
              ${
                trackingUrl
                  ? `<p>
                  <a href="${trackingUrl}" class="tracking-btn">Track Your Order</a>
                </p>`
                  : ''
              }
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Thank you for your business! 💜</p>
            </div>
            
            <div class="footer">
              <p>© 2026 Mystique Apparel. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: 'orders@mystiqueapparel.in',
      to: email,
      subject: `Order #${orderId} - ${status.toUpperCase()}`,
      html,
    });

    if (response.error) {
      console.error('[RESEND] Email send error:', response.error);
      return null;
    }

    console.log('[RESEND] ✅ Status update email sent:', response.id);
    return response;
  } catch (error) {
    console.error('[RESEND] Exception sending status email:', error.message);
    return null;
  }
}

export { sendOrderConfirmationEmail, sendOrderStatusEmail };
export default resend;
