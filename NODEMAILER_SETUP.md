# Nodemailer & Email Configuration Guide

This guide explains all the environment variables needed to set up Nodemailer for sending emails in Mystique Apparel admin dashboard.

## Quick Setup

Add these variables to your `.env.local` file in the root of your Next.js project:

```env
# SMTP Configuration (Email Service Provider)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password-or-app-password

# Sender Information
SENDER_EMAIL=noreply@mystique-apparel.com
SENDER_NAME=Mystique Apparel
```

## Variable Explanations

### SMTP_HOST
**What it is**: The mail server address of your email provider
**Example values**:
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- SendGrid: `smtp.sendgrid.net`
- Mailtrap: `smtp.mailtrap.io`
- Custom SMTP: `mail.yourdomain.com`

### SMTP_PORT
**What it is**: The port number your email provider uses for sending
**Common values**:
- `587` - Standard TLS/STARTTLS port (most common, recommended)
- `465` - SSL/TLS port (secure connection)
- `25` - Legacy unencrypted (not recommended)
- `2525` - Alternative port for some providers

**Choose based on your provider's settings**

### SMTP_USER
**What it is**: Your email account username for authentication
**Example**: `your-email@gmail.com` or just `your-email` (depends on provider)

**Note**: This is NOT necessarily your Mystique email. It's the account you're sending emails FROM at the SMTP provider.

### SMTP_PASS
**What it is**: Your password or app-specific password
**Important**:
- For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833), NOT your regular password
- For Outlook: Use your account password
- For SendGrid: Use your API key as the password
- For other providers: Check their documentation

**Security**: Never commit this to git! Keep it only in `.env.local`

### SENDER_EMAIL
**What it is**: The email address that will appear in the "From" field
**Example**: `noreply@mystique-apparel.com`

**Note**: 
- Some providers require this to match the SMTP_USER
- Some allow different sender addresses with domain verification
- Check your provider's requirements

### SENDER_NAME
**What it is**: The display name in the "From" field
**Example**: `Mystique Apparel` or `Mystique Support Team`
**Default**: `Mystique Apparel`

## Setup by Email Provider

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SENDER_EMAIL=your-email@gmail.com
SENDER_NAME=Mystique Apparel
```

**Steps**:
1. Enable 2-Factor Authentication on your Google Account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use the 16-character password as SMTP_PASS

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxx_your_api_key_here
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=Mystique Apparel
```

**Steps**:
1. Create account at [SendGrid](https://sendgrid.com)
2. Verify your domain
3. Create an API key in Settings > API Keys
4. Use `apikey` as SMTP_USER and your API key as SMTP_PASS

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SENDER_EMAIL=your-email@outlook.com
SENDER_NAME=Mystique Apparel
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SENDER_EMAIL=admin@yourdomain.com
SENDER_NAME=Mystique Apparel
```

## Testing Your Configuration

The API endpoint includes a health check:

```bash
# Test your email service configuration
curl http://localhost:3000/api/send-email

# Expected successful response:
{
  "success": true,
  "message": "Email service is connected and ready",
  "senderEmail": "noreply@mystique-apparel.com"
}
```

## Sending Emails

### API Endpoint
**POST** `/api/send-email`

### Request Body
```javascript
{
  "recipients": ["customer1@example.com", "customer2@example.com"],
  "subject": "Welcome to Mystique Apparel!",
  "htmlContent": "<h1>Hello!</h1><p>Welcome to our exclusive collection.</p>",
  "batchSize": 150, // Optional: 100-200 recommended, default 150
  "senderEmail": "noreply@mystique-apparel.com", // Optional: uses env var if not provided
  "senderName": "Mystique Apparel" // Optional: uses env var if not provided
}
```

### Response
```javascript
{
  "success": true,
  "message": "Email campaign sent successfully",
  "summary": {
    "totalRecipients": 1000,
    "validRecipients": 998,
    "invalidRecipients": 2,
    "successCount": 998,
    "failureCount": 0,
    "totalBatches": 7,
    "batchSize": 150
  },
  "batchResults": [
    {
      "batchNumber": 1,
      "recipientCount": 150,
      "messageId": "<...>",
      "status": "sent"
    }
  ]
}
```

## Batching Strategy Explained

The API automatically splits your recipients into batches (default 150 per batch, configurable 100-200):

**Why BCC Mode?**
- ✅ Privacy: Recipients don't see each other's emails
- ✅ Efficiency: Send multiple recipients per request
- ✅ Professional: Respects rate limits of email providers
- ✅ Scalability: Handle 10,000+ recipients smoothly

**Example**: 1000 recipients → 7 batches of ~150 each

## Troubleshooting

### "Email service is not properly configured"
- Check all SMTP variables are set in `.env.local`
- Restart your Next.js development server after adding env vars
- Verify credentials are correct

### "Failed to send emails"
- Check recipient email addresses are valid
- Verify SMTP_HOST and SMTP_PORT are correct for your provider
- Check SMTP_USER and SMTP_PASS are correct
- Some providers may require IP whitelist approval

### "Invalid credentials"
- Verify your password (especially Gmail's app password)
- Check your SMTP_USER format (some providers need full email, some just username)
- Ensure you're using an App Password for Gmail, not your regular password

### "SMTP connection timeout"
- Check SMTP_HOST is correct
- Verify SMTP_PORT matches your provider's configuration
- Check your firewall isn't blocking the port
- Some networks block port 25

## Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Use `.env.local.example`** - Create a template without real credentials:
   ```env
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password-here
   SENDER_EMAIL=noreply@example.com
   SENDER_NAME=Your Company Name
   ```

3. **For production** (Vercel, Netlify, etc.):
   - Add environment variables in your deployment platform's settings
   - Never paste credentials into `.env.local` files in production

4. **Use App Passwords** - Create provider-specific passwords instead of using your main account password

5. **Rotate Credentials** - Change passwords/API keys periodically

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard:
   - Vercel: Settings > Environment Variables
   - Netlify: Site settings > Build & deploy > Environment
   - AWS/Heroku: Use their env variable management

2. Use the same variable names: `SMTP_HOST`, `SMTP_PORT`, etc.

3. Test the health check endpoint after deployment:
   ```bash
   curl https://your-production-domain.com/api/send-email
   ```

## Additional Resources

- [Nodemailer Official Documentation](https://nodemailer.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Integration](https://sendgrid.com/docs/for-developers/sending-email/integrating-with-the-smtp-api/)
- [Outlook SMTP Settings](https://support.microsoft.com/en-us/office/imap-pop-smtp-settings-8151fcca-37f1-46e7-96ee-74f2b1ef1e23)

## Questions?

If you encounter issues:
1. Check the API health endpoint: `GET /api/send-email`
2. Review server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Test with a single recipient first before batch sending
