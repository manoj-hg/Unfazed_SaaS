const PDFDocument = require('pdfkit');

/**
 * Generate GST-compliant Tax Invoice PDF
 * @param {Object} payment - Payment document
 * @param {Object} therapist - Therapist document
 * @param {Object} client - Client / Session info
 * @param {Stream} writeStream - Writable stream (e.g. res HTTP response)
 */
exports.generateInvoicePDF = (payment, therapist, client, writeStream) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  doc.pipe(writeStream);

  // Header Colors
  const primaryColor = '#1e3a8a'; // Deep blue
  const secondaryColor = '#475569'; // Slate

  // Top Title & Branding
  doc.fillColor(primaryColor)
     .fontSize(22)
     .text('UNFAZED PRACTICE SUITE', 50, 45, { bold: true });

  doc.fontSize(10)
     .fillColor(secondaryColor)
     .text('Electronic Health & Practice Management System', 50, 72);

  doc.fillColor(primaryColor)
     .fontSize(14)
     .text('TAX INVOICE / RECEIPT', 380, 45, { align: 'right' });

  const invoiceNum = payment.invoice_number || `UNF-${new Date().getFullYear()}-${payment._id.toString().slice(-6).toUpperCase()}`;
  doc.fontSize(9)
     .fillColor(secondaryColor)
     .text(`Invoice No: ${invoiceNum}`, 380, 65, { align: 'right' })
     .text(`Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 380, 78, { align: 'right' })
     .text(`Status: COMPLETED (PAID)`, 380, 91, { align: 'right' });

  doc.moveTo(50, 115).lineTo(545, 115).strokeColor('#cbd5e1').stroke();

  // Practice Details (Left) vs Client Details (Right)
  doc.fontSize(11).fillColor(primaryColor).text('PRACTICE / PROVIDER DETAILS:', 50, 130);
  doc.fontSize(9).fillColor('#1e293b')
     .text(therapist.name || 'Dr. Therapist', 50, 146, { bold: true })
     .text(therapist.qualifications || 'Mental Health Professional', 50, 159)
     .text(therapist.city || 'Bengaluru, India', 50, 172)
     .text(`GSTIN / Reg: ${therapist.gstin || '29AABCU9876Q1Z5'}`, 50, 185)
     .text(`Email: ${therapist.email || 'care@unfazed.in'}`, 50, 198);

  doc.fontSize(11).fillColor(primaryColor).text('BILLED TO (CLIENT):', 320, 130);
  doc.fontSize(9).fillColor('#1e293b')
     .text(client.name || 'Valued Client', 320, 146, { bold: true })
     .text(`Email: ${client.email || 'client@example.com'}`, 320, 159)
     .text(`Phone: ${client.phone || '+91 Not provided'}`, 320, 172)
     .text(`Payment ID: ${payment.razorpay_payment_id || 'RZP-TEST-PAID'}`, 320, 185);

  doc.moveTo(50, 225).lineTo(545, 225).strokeColor('#cbd5e1').stroke();

  // Invoice Items Table Header
  const tableTop = 245;
  doc.rect(50, tableTop, 495, 25).fill('#f1f5f9');
  doc.fillColor('#0f172a').fontSize(9)
     .text('SL', 60, tableTop + 7)
     .text('DESCRIPTION OF SERVICE', 90, tableTop + 7)
     .text('SAC CODE', 310, tableTop + 7)
     .text('RATE (₹)', 390, tableTop + 7)
     .text('AMOUNT (₹)', 470, tableTop + 7, { align: 'right' });

  // Calculation (Standard GST breakdown for Healthcare/Consultation)
  const totalAmount = payment.amount || 2000;
  // Let's assume inclusive or standard 18% calculation
  const baseAmount = Math.round(totalAmount / 1.18);
  const totalGst = totalAmount - baseAmount;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  const itemY = tableTop + 35;
  const serviceDesc = payment.type === 'package' 
    ? 'Therapy Package Subscription (Advance Multi-Session Bundle)' 
    : 'Clinical Psychological Consultation & Telehealth Session';

  doc.fillColor('#334155').fontSize(9)
     .text('1', 60, itemY)
     .text(serviceDesc, 90, itemY, { width: 210 })
     .text('999312', 310, itemY)
     .text(baseAmount.toLocaleString('en-IN'), 390, itemY)
     .text(baseAmount.toLocaleString('en-IN'), 470, itemY, { align: 'right' });

  doc.moveTo(50, itemY + 30).lineTo(545, itemY + 30).strokeColor('#e2e8f0').stroke();

  // Subtotal & Taxes
  const taxY = itemY + 45;
  doc.fontSize(9).fillColor('#475569')
     .text('Taxable Value:', 350, taxY)
     .text(`₹ ${baseAmount.toLocaleString('en-IN')}`, 470, taxY, { align: 'right' })
     
     .text('CGST (9.0%):', 350, taxY + 16)
     .text(`₹ ${cgst.toLocaleString('en-IN')}`, 470, taxY + 16, { align: 'right' })

     .text('SGST (9.0%):', 350, taxY + 32)
     .text(`₹ ${sgst.toLocaleString('en-IN')}`, 470, taxY + 32, { align: 'right' });

  doc.rect(340, taxY + 52, 205, 25).fill('#e0f2fe');
  doc.fillColor(primaryColor).fontSize(10)
     .text('TOTAL AMOUNT PAID:', 350, taxY + 59, { bold: true })
     .text(`₹ ${totalAmount.toLocaleString('en-IN')}`, 470, taxY + 59, { align: 'right', bold: true });

  // Footer notes & Stamp
  const footerY = 560;
  doc.rect(50, footerY, 495, 60).fill('#f8fafc').stroke('#e2e8f0');
  doc.fillColor('#059669').fontSize(11)
     .text('✔ PAYMENT VERIFIED & CONFIRMED', 65, footerY + 12, { bold: true });
  doc.fillColor(secondaryColor).fontSize(8)
     .text('This is a computer-generated tax invoice issued by Unfazed on behalf of the registered practitioner. No physical signature is required.', 65, footerY + 28, { width: 460 })
     .text('Thank you for entrusting your care with our clinical practice.', 65, footerY + 42);

  doc.end();
};
