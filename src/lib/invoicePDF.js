import { jsPDF } from 'jspdf';

/**
 * Generate a professional PDF invoice for an order
 * @param {Object} orderData - Order information
 * @returns {Buffer|Uint8Array} PDF buffer
 */
export function generateInvoicePDF(orderData) {
  const {
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items = [],
    subtotal,
    shippingCost = 0,
    tax = 0,
    discount = 0,
    totalAmount,
    orderDate,
  } = orderData;

  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryColor = [102, 126, 234]; // #667eea
  const secondaryColor = [118, 75, 162]; // #764ba2
  const darkGray = [51, 51, 51];
  const lightGray = [128, 128, 128];
  const black = [0, 0, 0];

  // ----- HEADER -----
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('MYSTIQUE APPAREL', 15, 20);

  // Tagline
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Premium Fashion, Elegantly Crafted', 15, 27);

  // Invoice label
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 145, 25);

  // ----- COMPANY & ORDER INFO -----
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  
  // Company address (left side)
  doc.text('Mystique Apparel', 15, 50);
  doc.text('apparelmystique1@gmail.com', 15, 55);
  doc.text('www.mystiqueapparel.in', 15, 60);

  // Invoice details (right side)
  doc.setFont(undefined, 'bold');
  doc.text('Invoice Number:', 120, 50);
  doc.text('Order Number:', 120, 55);
  doc.text('Order Date:', 120, 60);

  doc.setFont(undefined, 'normal');
  doc.text(`INV-${orderNumber || orderId}`, 160, 50);
  doc.text(orderNumber || orderId, 160, 55);
  doc.text(orderDate ? new Date(orderDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 160, 60);

  // ----- CUSTOMER INFO -----
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 70, 180, 25, 'F');

  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('BILL TO:', 20, 78);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(customerName || 'Customer', 20, 84);
  doc.text(customerEmail || '', 20, 89);
  if (customerPhone) {
    doc.text(customerPhone, 20, 94);
  }

  // Shipping address (right side of customer section)
  if (shippingAddress) {
    doc.setFont(undefined, 'bold');
    doc.text('SHIP TO:', 120, 78);
    doc.setFont(undefined, 'normal');
    
    const addressLines = [
      shippingAddress.addressLine1,
      shippingAddress.addressLine2,
      `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
      shippingAddress.country || 'India',
    ].filter(Boolean);

    addressLines.forEach((line, index) => {
      doc.text(line, 120, 84 + (index * 5));
    });
  }

  // ----- ITEMS TABLE -----
  const tableStartY = 105;
  const tableHeaders = ['Item', 'Size', 'Color', 'Qty', 'Price', 'Total'];
  const colWidths = [70, 20, 25, 15, 25, 25];
  const colX = [15, 85, 105, 130, 145, 170];

  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(15, tableStartY, 180, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  tableHeaders.forEach((header, index) => {
    const align = index >= 3 ? 'right' : 'left';
    const x = align === 'right' ? colX[index] + colWidths[index] - 3 : colX[index] + 2;
    doc.text(header, x, tableStartY + 5.5, { align });
  });

  // Table rows
  doc.setTextColor(...darkGray);
  doc.setFont(undefined, 'normal');
  let currentY = tableStartY + 8;

  items.forEach((item, index) => {
    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, currentY, 180, 7, 'F');
    }

    const rowData = [
      item.productName || item.productTitle || 'Product',
      item.variantSize || item.size || '-',
      item.variantColor || item.color || '-',
      item.quantity?.toString() || '1',
      `₹${(item.price || 0).toFixed(2)}`,
      `₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`,
    ];

    rowData.forEach((data, colIndex) => {
      const align = colIndex >= 3 ? 'right' : 'left';
      const x = align === 'right' ? colX[colIndex] + colWidths[colIndex] - 3 : colX[colIndex] + 2;
      doc.text(data, x, currentY + 5, { align });
    });

    currentY += 7;
  });

  // Table bottom border
  doc.setDrawColor(...lightGray);
  doc.line(15, currentY, 195, currentY);

  // ----- TOTALS SECTION -----
  currentY += 10;
  const totalsX = 145;
  const valuesX = 190;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);

  // Subtotal
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(`₹${(subtotal || 0).toFixed(2)}`, valuesX, currentY, { align: 'right' });
  currentY += 6;

  // Shipping
  doc.text('Shipping:', totalsX, currentY);
  doc.text(shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE', valuesX, currentY, { align: 'right' });
  currentY += 6;

  // Tax (if applicable)
  if (tax > 0) {
    doc.text('Tax (GST):', totalsX, currentY);
    doc.text(`₹${tax.toFixed(2)}`, valuesX, currentY, { align: 'right' });
    currentY += 6;
  }

  // Discount (if applicable)
  if (discount > 0) {
    doc.setTextColor(0, 128, 0); // Green for discount
    doc.text('Discount:', totalsX, currentY);
    doc.text(`-₹${discount.toFixed(2)}`, valuesX, currentY, { align: 'right' });
    doc.setTextColor(...darkGray);
    currentY += 6;
  }

  // Total line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, currentY - 2, valuesX, currentY - 2);

  // Total amount
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount:', totalsX, currentY + 5);
  doc.text(`₹${(totalAmount || 0).toFixed(2)}`, valuesX, currentY + 5, { align: 'right' });

  // ----- FOOTER -----
  const footerY = 270;
  doc.setDrawColor(...lightGray);
  doc.line(15, footerY, 195, footerY);

  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Thank you for shopping with Mystique Apparel!', 105, footerY + 5, { align: 'center' });
  doc.text('For any queries, contact us at apparelmystique1@gmail.com', 105, footerY + 10, { align: 'center' });

  // Terms
  doc.setFontSize(7);
  doc.text('Terms: All sales are final. Returns accepted within 7 days of delivery for unused items with original tags.', 105, footerY + 17, { align: 'center' });

  // Generate PDF as buffer
  const doc = buildInvoiceDoc(orderData);
  const pdfBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfBuffer);

/**
 * Generate a professional PDF invoice for an order
 * @param {Object} orderData - Order information
 * @returns {Buffer|Uint8Array} PDF buffer
 */
export function generateInvoicePDF(orderData) {
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
    discount = 0,
    totalAmount = 0,
    orderDate,
  } = orderData;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const colors = {
    primary: [39, 58, 140],
    dark: [30, 30, 30],
    muted: [110, 110, 110],
    line: [210, 210, 210],
    rowAlt: [248, 248, 248],
    white: [255, 255, 255],
  };

  const invoiceNo = `INV-${orderNumber || orderId || 'N/A'}`;
  const orderNo = orderNumber || orderId || 'N/A';
  const dateText = orderDate
    ? new Date(orderDate).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  // Header band
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(...colors.white);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(18);
  doc.text('MYSTIQUE APPAREL', 14, 14);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Official Tax Invoice', 14, 20);

  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.text('INVOICE', 196, 18, { align: 'right' });

  // Company block
  doc.setTextColor(...colors.dark);
  doc.setDrawColor(...colors.line);
  doc.rect(14, 36, 96, 28);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('From', 18, 43);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Mystique Apparel', 18, 49);
  doc.text('apparelmystique1@gmail.com', 18, 54);
  doc.text('www.mystiqueapparel.in', 18, 59);

  // Invoice meta block
  doc.rect(114, 36, 82, 28);
  doc.setFontSize(9);
  drawLabelValue(doc, 'Invoice No:', invoiceNo, 118, 192, 44);
  drawLabelValue(doc, 'Order No:', orderNo, 118, 192, 50);
  drawLabelValue(doc, 'Date:', dateText, 118, 192, 56);

  // Billing / Shipping blocks
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
  const cols = [14, 96, 116, 136, 151, 173, 196];
  const headers = ['Item', 'Size', 'Color', 'Qty', 'Unit Price', 'Line Total'];
  const rowH = 7;

  doc.setFillColor(...colors.primary);
  doc.rect(14, tableTop, 182, rowH, 'F');
  doc.setTextColor(...colors.white);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(8.5);
  doc.text(headers[0], cols[0] + 2, tableTop + 4.7);
  doc.text(headers[1], cols[1] + 2, tableTop + 4.7);
  doc.text(headers[2], cols[2] + 2, tableTop + 4.7);
  doc.text(headers[3], cols[3] + 13, tableTop + 4.7, { align: 'right' });
  doc.text(headers[4], cols[4] + 20, tableTop + 4.7, { align: 'right' });
  doc.text(headers[5], cols[5] + 22, tableTop + 4.7, { align: 'right' });

  doc.setTextColor(...colors.dark);
  doc.setFont(undefined, 'normal');
  let rowY = tableTop + rowH;

  const safeItems = items.length ? items : [{ productName: 'Order Item', quantity: 1, price: Number(totalAmount || subtotal || 0) }];

  safeItems.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(...colors.rowAlt);
      doc.rect(14, rowY, 182, rowH, 'F');
    }

    const name = String(item.productName || item.productTitle || 'Product');
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = qty * price;

    const truncated = name.length > 36 ? `${name.slice(0, 33)}...` : name;

    doc.text(truncated, cols[0] + 2, rowY + 4.7);
    doc.text(String(item.variantSize || item.size || '-'), cols[1] + 2, rowY + 4.7);
    doc.text(String(item.variantColor || item.color || '-'), cols[2] + 2, rowY + 4.7);
    doc.text(String(qty), cols[3] + 13, rowY + 4.7, { align: 'right' });
    doc.text(formatINR(price), cols[4] + 20, rowY + 4.7, { align: 'right' });
    doc.text(formatINR(lineTotal), cols[5] + 22, rowY + 4.7, { align: 'right' });

    rowY += rowH;
  });

  // Table grid
  doc.setDrawColor(...colors.line);
  doc.rect(14, tableTop, 182, rowY - tableTop);
  for (let i = 1; i < cols.length - 1; i++) {
    doc.line(cols[i], tableTop, cols[i], rowY);
  }
  for (let yLine = tableTop + rowH; yLine < rowY; yLine += rowH) {
    doc.line(14, yLine, 196, yLine);
  }

  // Totals box
  const totalsTop = rowY + 8;
  doc.rect(124, totalsTop, 72, 34);
  doc.setFontSize(9);
  drawLabelValue(doc, 'Subtotal', formatINR(subtotal), 128, 192, totalsTop + 7);
  drawLabelValue(doc, 'Shipping', shippingCost > 0 ? formatINR(shippingCost) : 'FREE', 128, 192, totalsTop + 13);
  if (tax > 0) {
    drawLabelValue(doc, 'Tax (GST)', formatINR(tax), 128, 192, totalsTop + 19);
  }
  if (discount > 0) {
    drawLabelValue(doc, 'Discount', `-${formatINR(discount)}`, 128, 192, totalsTop + 25);
  }

  doc.setDrawColor(...colors.dark);
  doc.line(128, totalsTop + 27, 192, totalsTop + 27);
  doc.setFont(undefined, 'bold');
  drawLabelValue(doc, 'Total', formatINR(totalAmount), 128, 192, totalsTop + 33, { bold: true });

  // Footer (formal + no return policy)
  const footerY = 283;
  doc.setDrawColor(...colors.line);
  doc.line(14, footerY - 7, 196, footerY - 7);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text('This is a system-generated official invoice.', 105, footerY - 1, { align: 'center' });
  doc.text('For support: apparelmystique1@gmail.com', 105, footerY + 7, { align: 'center' });

  return doc;
}
}

/**
 * Generate PDF and return as base64 string (for email attachments)
 * @param {Object} orderData - Order information
 * @returns {string} Base64 encoded PDF
 */
export function generateInvoicePDFBase64(orderData) {
  const doc = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  // Same PDF generation logic as above...
  const {
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items = [],
    subtotal,
    shippingCost = 0,
    tax = 0,
    discount = 0,
    totalAmount,
    orderDate,
  } = orderData;

  // Colors
  const primaryColor = [102, 126, 234];
  const secondaryColor = [118, 75, 162];
  const darkGray = [51, 51, 51];
  const lightGray = [128, 128, 128];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, 'bold');
  doc.text('MYSTIQUE APPAREL', 15, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Premium Fashion, Elegantly Crafted', 15, 27);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 145, 25);

  // Company & order info
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Mystique Apparel', 15, 50);
  doc.text('apparelmystique1@gmail.com', 15, 55);
  doc.text('www.mystiqueapparel.in', 15, 60);
  doc.setFont(undefined, 'bold');
  doc.text('Invoice Number:', 120, 50);
  doc.text('Order Number:', 120, 55);
  doc.text('Order Date:', 120, 60);
  doc.setFont(undefined, 'normal');
  doc.text(`INV-${orderNumber || orderId}`, 160, 50);
  doc.text(orderNumber || orderId, 160, 55);
  doc.text(orderDate ? new Date(orderDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 160, 60);

  // Customer info
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 70, 180, 25, 'F');
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('BILL TO:', 20, 78);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(customerName || 'Customer', 20, 84);
  doc.text(customerEmail || '', 20, 89);
  if (customerPhone) {
    doc.text(customerPhone, 20, 94);
  }

  if (shippingAddress) {
    doc.setFont(undefined, 'bold');
    doc.text('SHIP TO:', 120, 78);
    doc.setFont(undefined, 'normal');
    const addressLines = [
      shippingAddress.addressLine1,
      shippingAddress.addressLine2,
      `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`,
      shippingAddress.country || 'India',
    ].filter(Boolean);
    addressLines.forEach((line, index) => {
      doc.text(line, 120, 84 + (index * 5));
    });
  }

  // Items table
  const tableStartY = 105;
  const tableHeaders = ['Item', 'Size', 'Color', 'Qty', 'Price', 'Total'];
  const colWidths = [70, 20, 25, 15, 25, 25];
  const colX = [15, 85, 105, 130, 145, 170];

  doc.setFillColor(...primaryColor);
  doc.rect(15, tableStartY, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  tableHeaders.forEach((header, index) => {
    const align = index >= 3 ? 'right' : 'left';
    const x = align === 'right' ? colX[index] + colWidths[index] - 3 : colX[index] + 2;
    doc.text(header, x, tableStartY + 5.5, { align });
  });

  doc.setTextColor(...darkGray);
  doc.setFont(undefined, 'normal');
  let currentY = tableStartY + 8;

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, currentY, 180, 7, 'F');
    }
    const rowData = [
      item.productName || item.productTitle || 'Product',
      item.variantSize || item.size || '-',
      item.variantColor || item.color || '-',
      item.quantity?.toString() || '1',
      `₹${(item.price || 0).toFixed(2)}`,
      `₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`,
    ];
    rowData.forEach((data, colIndex) => {
      const align = colIndex >= 3 ? 'right' : 'left';
      const x = align === 'right' ? colX[colIndex] + colWidths[colIndex] - 3 : colX[colIndex] + 2;
      doc.text(data, x, currentY + 5, { align });
    });
    currentY += 7;
  });

  doc.setDrawColor(...lightGray);
  doc.line(15, currentY, 195, currentY);

  // Totals
  currentY += 10;
  const totalsX = 145;
  const valuesX = 190;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(`₹${(subtotal || 0).toFixed(2)}`, valuesX, currentY, { align: 'right' });
  currentY += 6;
  doc.text('Shipping:', totalsX, currentY);
  doc.text(shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE', valuesX, currentY, { align: 'right' });
  currentY += 6;
  if (tax > 0) {
    doc.text('Tax (GST):', totalsX, currentY);
    doc.text(`₹${tax.toFixed(2)}`, valuesX, currentY, { align: 'right' });
    currentY += 6;
  }
  if (discount > 0) {
    doc.setTextColor(0, 128, 0);
    doc.text('Discount:', totalsX, currentY);
    doc.text(`-₹${discount.toFixed(2)}`, valuesX, currentY, { align: 'right' });
    doc.setTextColor(...darkGray);
    currentY += 6;
  }
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX - 5, currentY - 2, valuesX, currentY - 2);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Total Amount:', totalsX, currentY + 5);
  doc.text(`₹${(totalAmount || 0).toFixed(2)}`, valuesX, currentY + 5, { align: 'right' });

  // Footer
  const footerY = 270;
  doc.setDrawColor(...lightGray);
  doc.line(15, footerY, 195, footerY);
  doc.setTextColor(...lightGray);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Thank you for shopping with Mystique Apparel!', 105, footerY + 5, { align: 'center' });
  doc.text('For any queries, contact us at apparelmystique1@gmail.com', 105, footerY + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Terms: All sales are final. Returns accepted within 7 days of delivery for unused items with original tags.', 105, footerY + 17, { align: 'center' });

  // Return as base64 string
  return doc.output('datauristring').split(',')[1];
}
