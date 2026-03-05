import { NextResponse } from 'next/server';
import { generateInvoicePDF } from '@/lib/invoicePdfFormal';
import { client } from '@/sanity';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('[INVOICE] Fetching order data for:', orderId);

    // Fetch order from Sanity
    const query = `*[_type == "order" && orderNumber == $orderId][0]{
      _id,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items[]{
        productTitle,
        variantSize,
        variantColor,
        quantity,
        price
      },
      subtotal,
      shippingCost,
      tax,
      discountCode,
      discountAmount,
      total,
      _createdAt
    }`;

    const order = await client.fetch(query, { orderId });

    if (!order) {
      console.error('[INVOICE] Order not found:', orderId);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('[INVOICE] Order fetched:', JSON.stringify(order, null, 2));
    console.log('[INVOICE] Order items count:', order.items?.length || 0);
    console.log('[INVOICE] Order items:', JSON.stringify(order.items, null, 2));

    console.log('[INVOICE] Generating PDF for order:', orderId);

    // Generate PDF
    const pdfBuffer = generateInvoicePDF({
      orderId: order.orderNumber,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      items: (order.items || []).map(item => {
        console.log('[INVOICE] Mapping item for PDF:', item);
        return {
          productName: item.productTitle,
          productTitle: item.productTitle,
          variantSize: item.variantSize,
          variantColor: item.variantColor,
          size: item.variantSize,
          color: item.variantColor,
          quantity: item.quantity,
          price: item.price,
        };
      }),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost || 0,
      tax: order.tax || 0,
      discount: order.discount || 0,
      totalAmount: order.total,
      orderDate: order._createdAt,
    });

    console.log('[INVOICE] PDF generated successfully');

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${orderId}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[INVOICE] Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice', details: error.message },
      { status: 500 }
    );
  }
}
