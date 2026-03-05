# Resend Email + Brevo Export Integration Guide

## ✅ What's Been Added

### 1. **Resend Email Service** (`/lib/email.js`)
- `sendOrderConfirmationEmail()` - Sends beautiful order confirmation emails on purchase
- `sendOrderStatusEmail()` - Sends order status updates (shipped, delivered, etc.)
- Automatically called when orders are created
- Beautiful HTML email templates with order details, pricing, and branding

### 2. **Order Email Integration** 
- Email automatically sent after successful payment via Razorpay
- Includes order ID, customer name, items, quantities, pricing
- Formatted with Mystique Apparel branding

### 3. **CSV Export for Brevo** (`/lib/csvExport.js`)
- `exportUsersToCSV()` - Converts user data to Brevo-compatible CSV format
- `downloadCSV()` - Triggers browser download
- `exportAndDownloadUsers()` - One-function export + download
- Includes: Email, Name, Phone, Addresses, Join Date

### 4. **Admin User Management** (`/src/app/admin/users/page.jsx`)
- **New Export Button** - "📥 Export to Brevo" button in User Management tab
- Shows total users to export
- Downloads CSV file formatted for Brevo import
- One-click operation

### 5. **API Endpoint** (`/src/app/api/admin/get-users/route.js`)
- Fetches all users from Sanity for export
- Returns user data with all necessary fields
- Used by admin dashboard

---

## 🚀 How to Use

### **For Transactional Emails (Order Confirmation)**

Emails are **automatically sent** when:
1. Customer completes payment via Razorpay ✅ (Already implemented)
2. Order is confirmed in the system ✅ (Already implemented)

**No manual action needed** - emails send automatically!

Check logs for confirmation:
```
[EMAIL] Sending order confirmation to: customer@email.com
✅ [EMAIL] Order confirmation sent successfully
```

### **For Brevo Export (Marketing Emails)**

1. **Go to Admin Dashboard** → Users Management
2. **Click "📥 Export to Brevo" button**
3. **CSV file downloads** with all user data
4. **Import to Brevo:**
   - Log in to Brevo
   - Contacts → Import Contacts
   - Upload the CSV file
   - Map fields (Email is required, others optional)
   - Save to contacts list

---

## 📝 Email Templates

### Order Confirmation Email
- Header with purple gradient branding
- Order ID and status badge
- Itemized list with product, quantity, price
- Total amount prominently displayed
- Shipping information note
- Footer with support contact

### Order Status Email
- Status-specific messages (Shipped, Delivered, etc.)
- Tracking link (if available)
- Order ID reference
- Professional styling

---

## 🔑 Configuration

### Resend API Key
Your API key is already set in `.env.local`:
```
NEXT_PUBLIC_RESEND_API_KEY=re_XPZMixAq_Gn5nqQZP6ped4ptMxZzzWkKz
```

**Important**: This is live production key. Keep it secret!

If you need to change it:
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Copy your API key
3. Update in Vercel: Settings → Environment Variables → `NEXT_PUBLIC_RESEND_API_KEY`
4. Redeploy

### Email Sender Address
Currently: `orders@mystique-apparel.com`

To change:
1. Update in `/lib/email.js` (line 67)
2. Verify domain in Resend dashboard first!

---

## 📊 CSV Export Format

Brevo expects this format (automatic):
```
Email,First Name,Last Name,Phone Number,Address,City,State,Postal Code,Country,Date Added
user@email.com,John,Doe,9876543210,123 Main St,Mumbai,Maharashtra,400001,India,2026-03-04
```

Your export includes all necessary fields!

---

## 🧪 Testing

### Test Order Email
1. Make a test purchase on your site
2. Check browser console for logs
3. Look for: `✅ [EMAIL] Order confirmation sent successfully`
4. Email sent to: Customer's registered email

### Test User Export
1. Go to Admin Dashboard → Users
2. Click "Export to Brevo" button
3. CSV file downloads
4. Open in Excel to verify format

---

## 🛠️ Troubleshooting

### Emails Not Sending?

Check browser console for errors:
```
❌ [EMAIL] Exception sending order email: {error message}
```

**Common issues:**
- Missing `NEXT_PUBLIC_RESEND_API_KEY` in env
- Invalid email address in order
- Resend API key is invalid
- Resend API key is for wrong project

### Export Not Working?

1. Check admin has access (isAdmin = true)
2. Verify users exist in Sanity
3. Check browser console for export errors
4. Make sure users have email addresses

---

## 📧 Resend Dashboard

Monitor emails sent: https://resend.com/emails

Shows:
- Email delivery status
- Open rates
- Click tracking
- Bounce rates
- Failed deliveries

---

## 🎯 Next Steps (Optional)

1. **Custom Email Templates**
   - Edit HTML in `/lib/email.js` for branding
   - Add company logo, colors, fonts

2. **More Email Types**
   - Shipping confirmations
   - Return/refund emails
   - Welcome emails for new users
   - Password reset emails

3. **Brevo Integration**
   - Set up marketing automation in Brevo
   - Create email sequences
   - Send campaigns to exported contacts

4. **Order Status Updates**
   - Hook up when order status changes (shipped, delivered)
   - Automatically send status emails with tracking links

---

## 📌 Important Notes

✅ **Transactional emails** (order confirmations) are AUTOMATIC
✅ **User export for Brevo** is ONE-CLICK in admin dashboard
✅ **No API keys needed** - already configured
✅ **Uses Resend** for reliable, professional email delivery
✅ **Brevo** for marketing campaigns (separate from transactional)

**Key difference:**
- **Resend**: Transactional emails (order confirmations) → Automatic
- **Brevo**: Marketing emails (campaigns, newsletters) → Manual export + campaigns

---

## 🎉 You're All Set!

Emails are configured and ready to use. Start receiving order confirmations and exporting users to Brevo for marketing!
