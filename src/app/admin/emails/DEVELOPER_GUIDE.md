# Email System Architecture & Developer Guide

## System Architecture

```
Email Management Page (page.jsx)
├── State Management
│   ├── emailBuilder (current email being composed)
│   ├── selectedUsers (recipient selection)
│   ├── recipientMode (database vs custom)
│   └── isSending (sending status)
│
├── Quick Actions
│   ├── "Use Template" → Opens Template Selector Modal
│   └── "Preview" → Opens Preview Modal
│
└── Components
    ├── AdvancedEmailBuilder
    │   ├── Expandable Design Style section
    │   ├── Expandable Email Content section
    │   └── Expandable Advanced Options section
    │
    ├── Recipients Sidebar
    │   ├── Database mode (search & select users)
    │   └── Custom mode (paste email list)
    │
    └── Action Buttons
        ├── Send Email
        └── Cancel
```

## Component Hierarchy

### 1. Main Page: `page.jsx`
**Role**: Orchestrates the entire email management experience
**Key Functions**:
- State management for email content
- User fetching from Sanity
- Email sending logic
- Modal management

**Props**: None (standalone page)
**State**:
```javascript
emailBuilder = {
  subject: string,
  greeting: string,
  headline: string,
  mainMessage: string,
  ctaText: string,
  ctaLink: string,
  footerText: string,
  bodyStyle: 'professional|marketing|minimal|dark|elegant'
}
```

### 2. AdvancedEmailBuilder.jsx
**Role**: Email composition form with expandable sections
**Key Features**:
- Organized sections (style, content, advanced)
- Character counters
- Form validation
- Best practices guide

**Props**:
```javascript
{
  emailData: { /* emailBuilder state */ },
  onUpdate: (newData) => void
}
```

**Expandable Sections**:
1. **Design Style** - Choose from 5 themes
2. **Email Content** - Subject, greeting, headline, message, CTA, footer
3. **Advanced Options** - From name, reply-to, tracking toggles

### 3. EmailTemplateSelector.jsx
**Role**: Browse and select email templates
**Features**:
- 6 categories (promotional, engagement, content, seasonal, service, reengagement)
- 15+ pre-built templates
- Color-coded categories
- Quick preview of subject lines

**Props**:
```javascript
{
  onSelectTemplate: (template) => void
}
```

**Template Data Structure**:
```javascript
{
  name: string,
  category: string,
  subject: string,
  greeting: string,
  headline: string,
  mainMessage: string,
  ctaText: string,
  ctaLink: string,
  footerText: string,
  bodyStyle: string
}
```

### 4. EmailPreviewRenderer.jsx
**Role**: Show how email will appear to recipients
**Features**:
- HTML/CSS rendering in iframe
- Support for all 5 design styles
- Mobile-responsive display
- Subject line display

**Props**:
```javascript
{
  emailData: { /* email content */ },
  style: 'professional|marketing|minimal|dark|elegant'
}
```

### 5. EmailAnalytics.jsx
**Role**: Display campaign performance metrics
**Features**:
- Total sent, opens, clicks
- Open rate, click rate
- Engagement calculation
- Trend indicators

**Props**:
```javascript
{
  stats: {
    totalSent: number,
    totalOpened: number,
    totalClicked: number,
    openRate: number,
    clickRate: number
  }
}
```

### 6. EmailTemplateLibrary.jsx
**Role**: Central template storage (data only)
**Export**: `EMAIL_TEMPLATES` object with all 15+ templates
**No rendering**: Pure data export

### 7. EmailTemplateReference.jsx
**Role**: Developer reference and quick guide
**Features**:
- Template catalog
- Style reference
- Usage guide
- Developer tips

## Data Flow

```
User clicks "Use Template"
    ↓
Template Selector Modal opens
    ↓
User selects template
    ↓
handleSelectTemplate(template)
    ↓
setEmailBuilder(template data)
    ↓
AdvancedEmailBuilder displays template
    ↓
User customizes content
    ↓
emailBuilder state updates
    ↓
Preview shows in real-time
    ↓
User selects recipients
    ↓
handleSendEmail()
    ↓
Email sent!
```

## Integration Points

### With Sanity CMS
```javascript
// Fetch users from Sanity
const data = await client.fetch(`
  *[_type == "userProfile" && email != null] {
    _id,
    displayName,
    email
  }
`);
```

### With Email Service Provider (Future)
```javascript
// Example: SendGrid integration
await sgMail.send({
  to: recipients,
  from: emailData.fromName,
  subject: emailData.subject,
  html: generateEmailHTML(),
  trackOpens: emailData.trackOpens,
  trackClicks: emailData.trackClicks
});
```

## Styling System

All components use Tailwind CSS with consistent styling:

### Color Scheme
- **Primary**: Blue (#007bff)
- **Secondary**: Purple (#a855f7)
- **Success**: Green (#22c55e)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Common Classes
```tailwind
bg-black/30          /* Dark backgrounds */
border-white/10      /* Subtle borders */
text-white          /* Main text */
text-gray-400       /* Secondary text */
focus:ring-blue-500 /* Focus states */
```

## Adding New Templates

1. Open `EmailTemplateLibrary.jsx`
2. Add entry to `EMAIL_TEMPLATES` object:
```javascript
yourTemplateName: {
  name: "Template Name",
  category: "promotional",  // or other category
  subject: "Subject line",
  greeting: "Hello! 👋",
  headline: "Main heading",
  mainMessage: "Body text...",
  ctaText: "Button text",
  ctaLink: "https://...",
  footerText: "Footer text",
  bodyStyle: "professional"
}
```

3. Template automatically appears in selector

## Adding New Design Styles

1. Open `EmailPreviewRenderer.jsx`
2. Add to `BODY_STYLES` object:
```javascript
yourStyle: {
  bgColor: "#ffffff",
  headerBg: "#000000",
  accentColor: "#ff0000",
  textColor: "#333333",
  borderColor: "#ddd"
}
```

3. Update `AdvancedEmailBuilder.jsx` style select options
4. Style automatically available in email builder

## Testing Checklist

- [ ] Email preview renders correctly
- [ ] All 5 design styles work
- [ ] Character counters are accurate
- [ ] Templates load and apply correctly
- [ ] Email sends to selected recipients
- [ ] Responsive on mobile devices
- [ ] Form validation works
- [ ] Error messages display properly
- [ ] Analytics tracking works (if enabled)

## Performance Considerations

1. **Template Loading**: 15+ templates cached at component load
2. **Preview Rendering**: iframe-based to avoid layout issues
3. **Form Validation**: Client-side only (fast feedback)
4. **Email Sending**: Simulated (2sec timeout for demo)
5. **Character Counting**: Real-time, efficient

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ ARIA labels on form inputs
- ✅ Keyboard navigation support
- ✅ Color contrast compliance
- ✅ Error message announcements
- ✅ Form field descriptions

## Future Enhancement Ideas

1. **Drag-and-Drop Builder**: Visual email composition
2. **Template Scheduling**: Send at optimal times
3. **A/B Testing**: Compare variations
4. **Dynamic Content**: Merge tags for personalization
5. **Image Library**: Built-in image management
6. **Survey Blocks**: Customer feedback forms
7. **Automation Workflows**: Trigger-based emails
8. **Advanced Analytics**: Detailed campaign reports
9. **Email Verification**: Validate addresses before sending
10. **Compliance Checker**: CAN-SPAM/GDPR validation

## Troubleshooting

### Preview not updating
- Check that all required fields are filled
- Ensure bodyStyle value is valid
- Clear browser cache

### Templates not appearing
- Verify EmailTemplateLibrary.jsx exports correctly
- Check template object structure
- Confirm category names match selector

### Sending fails
- Validate recipient emails
- Check Sanity client connection
- Verify email service provider integration

## File Structure Reference

```
src/app/admin/emails/
├── page.jsx                          # Main page (300 lines)
├── EMAIL_SYSTEM_GUIDE.md             # User documentation
├── DEVELOPER_GUIDE.md                # This file
└── components/
    ├── index.js                      # Central exports
    ├── EmailTemplateLibrary.jsx       # 15+ templates
    ├── EmailTemplateSelector.jsx      # Template browser
    ├── AdvancedEmailBuilder.jsx       # Email composer
    ├── EmailPreviewRenderer.jsx       # Preview display
    ├── EmailAnalytics.jsx             # Analytics dashboard
    └── EmailTemplateReference.jsx     # Developer reference
```

## API Reference

### handleSelectTemplate(template)
Applies selected template to email builder
```javascript
handleSelectTemplate({
  name: "New Collection Launch",
  subject: "🎨 Introducing Our Latest Collection",
  // ... other template fields
})
```

### handleEmailUpdate(newData)
Updates email builder with new data
```javascript
handleEmailUpdate({
  ...emailBuilder,
  subject: "New subject"
})
```

### handleSendEmail()
Validates form and sends email to selected recipients
- Validates required fields
- Checks recipient selection
- Shows confirmation
- Resets form after success

## Support & Questions

For implementation questions or issues:
1. Check EMAIL_SYSTEM_GUIDE.md for user docs
2. Review DEVELOPER_GUIDE.md (this file)
3. Check component comments
4. Review example templates in EmailTemplateLibrary.jsx
