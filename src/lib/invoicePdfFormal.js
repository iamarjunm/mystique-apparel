import { jsPDF } from 'jspdf';

const formatINR = (value = 0) => `₹${Number(value || 0).toFixed(2)}`;

function drawLabelValue(doc, label, value, xLabel, xValue, y, bold = false) {
  doc.setFont(undefined, bold ? 'bold' : 'normal');
  doc.text(label, xLabel, y);
  doc.text(String(value ?? ''), xValue, y, { align: 'right' });
}

function buildInvoiceDoc(orderData) {
  const {
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items = [],
    subtotal = 0,
    shippingCost = 0,
    tax = 0,
    discountCode = null,
    discountAmount = 0,
    totalAmount = 0,
    orderDate,
  } = orderData;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const colors = {
    primary: [39, 58, 140],
    dark: [28, 28, 28],
    muted: [100, 100, 100],
    line: [210, 210, 210],
    rowAlt: [248, 248, 248],
    white: [255, 255, 255],
  };

  const invoiceNo = `INV-${orderNumber || orderId || 'N/A'}`;
  const orderNo = orderNumber || orderId || 'N/A';
  const dateText = orderDate
    ? new Date(orderDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  // Header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(...colors.white);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(18);
  doc.text('MYSTIQUE APPAREL', 14, 14);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Official Invoice', 14, 20);

  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('INVOICE', 196, 18, { align: 'right' });

  // Sender block
  doc.setTextColor(...colors.dark);
  doc.setDrawColor(...colors.line);
  doc.rect(14, 36, 96, 28);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('From', 18, 43);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Mystique Apparel', 18, 49);
  doc.text('apparelmystique1@gmail.com', 18, 54);
  doc.text('www.mystiqueapparel.in', 18, 59);

  // Invoice metadata block
  doc.rect(114, 36, 82, 28);
  doc.setFontSize(9);
  drawLabelValue(doc, 'Invoice No:', invoiceNo, 118, 192, 44);
  drawLabelValue(doc, 'Order No:', orderNo, 118, 192, 50);
  drawLabelValue(doc, 'Date:', dateText, 118, 192, 56);

  // Bill/Ship blocks
  doc.rect(14, 70, 90, 36);
  doc.rect(106, 70, 90, 36);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('Bill To', 18, 77);
  doc.text('Ship To', 110, 77);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8.5);

  const billLines = [customerName || 'Customer', customerEmail || '', customerPhone || ''].filter(Boolean);
  let y = 83;
  billLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), 82);
    wrapped.forEach((w) => {
      doc.text(w, 18, y);
      y += 4.5;
    });
  });

  const addressLines = shippingAddress
    ? [
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(', '),
        shippingAddress.country || 'India',
      ].filter(Boolean)
    : ['Address not available'];

  y = 83;
  addressLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(String(line), 82);
    wrapped.forEach((w) => {
      doc.text(w, 110, y);
      y += 4.5;
    });
  });

  // Items table
  const tableTop = 114;
  const cols = [14, 80, 100, 120, 145, 170, 196];
  const rowH = 8;

  // Table header
  doc.setFillColor(...colors.primary);
  doc.rect(14, tableTop, 182, 8, 'F');
  doc.setTextColor(...colors.white);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(8);
  doc.text('Item', cols[0] + 2, tableTop + 5.5);
  doc.text('Size', cols[1] + 2, tableTop + 5.5);
  doc.text('Color', cols[2] + 2, tableTop + 5.5);
  doc.text('Qty', cols[3] + 2, tableTop + 5.5);
  doc.text('Price', cols[4] + 2, tableTop + 5.5);
  doc.text('Amount', cols[5] + 2, tableTop + 5.5);

  doc.setTextColor(...colors.dark);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  let rowY = tableTop + 8;

  const safeItems = items.length
    ? items
    : [{ productName: 'Order Item', quantity: 1, price: Number(totalAmount || subtotal || 0) }];

  safeItems.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...colors.rowAlt);
      doc.rect(14, rowY, 182, rowH, 'F');
    }

    const name = String(item.productName || item.productTitle || 'Product');
    const size = String(item.variantSize || item.size || '-');
    const color = String(item.variantColor || item.color || '-');
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;

    console.log('[PDF BUILD] Row', idx, ':', { name, size, color, qty, price });

    // Truncate long names and ensure text is visible
    const truncName = name.length > 30 ? `${name.slice(0, 27)}...` : name;
    
    doc.setTextColor(...colors.dark);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    doc.text(truncName, cols[0] + 2, rowY + 5.5);
    doc.text(size, cols[1] + 2, rowY + 5.5);
    doc.text(color, cols[2] + 2, rowY + 5.5);
    doc.text(String(qty), cols[3] + 2, rowY + 5.5);
    doc.text(price.toFixed(2), cols[4] + 2, rowY + 5.5);
    doc.text(lineTotal.toFixed(2), cols[5] + 2, rowY + 5.5);

    rowY += rowH;
  });

  // Grid lines
  doc.setDrawColor(...colors.line);
  doc.rect(14, tableTop, 182, rowY - tableTop);
  for (let i = 1; i < cols.length - 1; i += 1) {
    doc.line(cols[i], tableTop, cols[i], rowY);
  }
  for (let yLine = tableTop + 8; yLine < rowY; yLine += rowH) {
    doc.line(14, yLine, 196, yLine);
  }

  // Totals
  const totalsTop = rowY + 10;
  doc.rect(124, totalsTop, 72, 36);
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.dark);
  drawLabelValue(doc, 'Subtotal', subtotal.toFixed(2), 128, 192, totalsTop + 7);
  drawLabelValue(doc, 'Shipping', shippingCost > 0 ? shippingCost.toFixed(2) : 'FREE', 128, 192, totalsTop + 13);
  if (tax > 0) drawLabelValue(doc, 'Tax (GST)', tax.toFixed(2), 128, 192, totalsTop + 19);
  if (discountAmount > 0) drawLabelValue(doc, 'Discount', `-${discountAmount.toFixed(2)}`, 128, 192, totalsTop + 25);

  doc.setDrawColor(...colors.dark);
  doc.line(128, totalsTop + 29, 192, totalsTop + 29);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  drawLabelValue(doc, 'Total', totalAmount.toFixed(2), 128, 192, totalsTop + 35, true);

  // Footer (no return policy)
  const footerY = 283;
  doc.setDrawColor(...colors.line);
  doc.line(14, footerY - 7, 196, footerY - 7);
  doc.setTextColor(...colors.muted);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.text('This is a system-generated official invoice.', 105, footerY - 1, { align: 'center' });
  doc.text('All sales are final. No return policy applies.', 105, footerY + 3, { align: 'center' });
  doc.text('For support: apparelmystique1@gmail.com', 105, footerY + 7, { align: 'center' });

  return doc;
}

export function generateInvoicePDF(orderData) {
  const doc = buildInvoiceDoc(orderData);
  const pdfBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfBuffer);
}

export function generateInvoicePDFBase64(orderData) {
  const doc = buildInvoiceDoc(orderData);
  return doc.output('datauristring').split(',')[1];
}
