import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send emails in batches using BCC (100-200 per batch)
 * BCC mode ensures recipients don't see each other's emails (privacy)
 * and is more efficient than 1-by-1 sending
 */
export async function POST(request) {
  try {
    const {
      recipients,
      subject,
      htmlContent,
      senderEmail = process.env.SENDER_EMAIL,
      senderName = process.env.SENDER_NAME || 'Mystique Apparel',
      batchSize = 150, // Default 150 per batch, can be adjusted (100-200 recommended)
    } = await request.json();

    // Validation
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Recipients array is required and must not be empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!subject || !htmlContent) {
      return new Response(
        JSON.stringify({ error: 'Subject and htmlContent are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!senderEmail) {
      return new Response(
        JSON.stringify({ error: 'SENDER_EMAIL environment variable is not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter(
      (email) => typeof email === 'string' && emailRegex.test(email.trim())
    );

    if (validRecipients.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid email addresses provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const invalidCount = recipients.length - validRecipients.length;

    // Split recipients into batches
    const batches = [];
    for (let i = 0; i < validRecipients.length; i += batchSize) {
      batches.push(validRecipients.slice(i, i + batchSize));
    }

    // Send emails in batches
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < batches.length; i++) {
      try {
        const batchRecipients = batches[i];

        const mailOptions = {
          from: `${senderName} <${senderEmail}>`,
          bcc: batchRecipients.join(','), // BCC all recipients in batch
          subject,
          html: htmlContent,
          replyTo: senderEmail,
          // Alternative plain text version for better compatibility
          text: htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' '),
        };

        const info = await transporter.sendMail(mailOptions);

        successCount += batchRecipients.length;
        results.push({
          batchNumber: i + 1,
          recipientCount: batchRecipients.length,
          messageId: info.messageId,
          status: 'sent',
        });

        console.log(`✅ Batch ${i + 1} sent successfully to ${batchRecipients.length} recipients`);
      } catch (error) {
        failureCount += batches[i].length;
        results.push({
          batchNumber: i + 1,
          recipientCount: batches[i].length,
          status: 'failed',
          error: error.message,
        });

        console.error(`❌ Batch ${i + 1} failed:`, error.message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email campaign sent successfully`,
        summary: {
          totalRecipients: recipients.length,
          validRecipients: validRecipients.length,
          invalidRecipients: invalidCount,
          successCount,
          failureCount,
          totalBatches: batches.length,
          batchSize,
        },
        batchResults: results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Email API error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send emails',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(request) {
  try {
    // Verify transporter connection
    await transporter.verify();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email service is connected and ready',
        senderEmail: process.env.SENDER_EMAIL,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Email service is not properly configured',
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
