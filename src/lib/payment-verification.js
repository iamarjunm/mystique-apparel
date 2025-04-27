// lib/payment-verification.js
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Validates a Razorpay payment against an order
 * @param {Object} shopifyOrder - The Shopify order object
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<boolean>} - Whether the payment is valid
 */
export async function validateRazorpayPayment(shopifyOrder, paymentId) {
  try {
    if (!shopifyOrder || !paymentId) {
      console.error('Missing required parameters for payment verification');
      return false;
    }

    // 1. First verify the payment status with Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    
    if (!payment) {
      console.error('Payment not found in Razorpay');
      return false;
    }

    // Check basic payment status
    if (payment.status !== 'captured') {
      console.error(`Payment not captured. Status: ${payment.status}`);
      return false;
    }

    // Verify amount matches (convert to paise for comparison)
    const orderAmount = parseFloat(shopifyOrder.total_price) * 100;
    if (payment.amount !== orderAmount) {
      console.error(`Amount mismatch. Payment: ${payment.amount}, Order: ${orderAmount}`);
      return false;
    }

    // Verify currency matches
    if (payment.currency !== shopifyOrder.currency.toUpperCase()) {
      console.error(`Currency mismatch. Payment: ${payment.currency}, Order: ${shopifyOrder.currency}`);
      return false;
    }

    // 2. Check if the payment is already recorded in Shopify
    const paymentInOrder = shopifyOrder.transactions?.some(
      txn => txn.gateway === 'razorpay' && txn.gateway_reference === paymentId
    );

    if (!paymentInOrder) {
      console.error('Payment not found in Shopify order transactions');
      return false;
    }

    return true;

  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

/**
 * Verifies Razorpay webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Razorpay signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} - Whether the signature is valid
 */
export function verifyWebhookSignature(body, signature, secret) {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Verifies Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - Whether the signature is valid
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
  try {
    if (!orderId || !paymentId || !signature) {
      console.error('Missing parameters for signature verification');
      return false;
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');
    
    return generatedSignature === signature;
  } catch (error) {
    console.error('Payment signature verification failed:', error);
    return false;
  }
}

/**
 * Fetches payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object|null>} - Payment details or null if not found
 */
export async function fetchPaymentDetails(paymentId) {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    const payment = await razorpay.payments.fetch(paymentId);
    
    if (!payment) {
      console.error('Payment not found');
      return null;
    }

    return {
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount / 100, // Convert to rupees
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      createdAt: new Date(payment.created_at * 1000), // Convert to JS timestamp
      capturedAt: payment.captured_at ? new Date(payment.captured_at * 1000) : null,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa,
      fee: payment.fee / 100,
      tax: payment.tax / 100,
      errorCode: payment.error_code,
      errorDescription: payment.error_description
    };

  } catch (error) {
    console.error('Error fetching payment details:', error);
    return null;
  }
}