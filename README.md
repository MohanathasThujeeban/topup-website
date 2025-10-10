# 🚀 EasyTopup.no - Instant Lycamobile ePIN & eSIM Delivery

A modern, responsive e-commerce website for selling Lycamobile ePINs and eSIMs with instant delivery. Built with React, Tailwind CSS, and Vite.

![EasyTopup.no](https://img.shields.io/badge/React-18.2.0-blue)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.3.6-38B2AC)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🏠 Home Page
- Eye-catching hero banner with gradient (blue → green)
- Three prominent feature icons:
  - ⚡ Instant ePIN Delivery
  - 💬 WhatsApp 24/7 Support
  - 💳 Safe Norwegian Payments (Vipps, Klarna, Cards)
- Customer testimonials with 5-star ratings
- "Why Choose Us" section with key benefits
- Trust badges for payment methods

### 🛍️ Bundles Page
- Product catalog with filter buttons (All, ePIN Only, eSIM Only)
- Responsive grid layout (1-4 columns based on screen size)
- Bundle cards with:
  - Product badges (POPULAR, BEST VALUE, NEW, eSIM)
  - Data, validity, and call details
  - Instant delivery tags
  - Hover effects with card lift
- Sticky "Compare Selected" button

### 📄 Product Detail Page
- Two-column layout:
  - Left: Product image gallery with trust badges
  - Right: Product details, features, pricing
- Star ratings and customer reviews count
- Features list with checkmarks
- Quantity selector (1-10)
- "Buy Now" and "Add to Cart" buttons
- Payment methods showcase
- Support section with WhatsApp button
- Tabbed content:
  - How to Activate
  - What's Included
  - FAQ
  - Reviews
- Related products carousel

### 💳 Checkout Page
- Clean, distraction-free design
- 3-step progress bar (Information → Payment → Confirmation)
- Customer information form:
  - Email (required for ePIN delivery)
  - WhatsApp number (optional)
  - Promotional offers checkbox
- Payment method selection:
  - Vipps (Norwegian mobile payment)
  - Klarna (Pay Later)
  - Credit/Debit Card
  - PayPal
- Card payment form (expands when selected)
- Order summary sticky card with:
  - Product details
  - Price breakdown
  - Delivery information
- Security badges (SSL, Norton, PCI)

### ✉️ Confirmation Page
- Success message with large checkmark icon
- Order details card with:
  - Order number
  - Date and time
  - Product info
  - Payment method
- "What's Next" step-by-step guide:
  - Check email
  - Find PIN code
  - Activate PIN
- Expandable detailed activation guide with:
  - Video tutorial placeholder
  - Step-by-step instructions
  - Common issues & solutions
- Support section:
  - Check spam folder
  - Resend email button
  - WhatsApp contact
  - Phone support
- Additional actions:
  - Download receipt
  - Order again
  - Rate experience

### 💌 Email Template
- Responsive HTML email design
- Gradient header with logo
- Large, highlighted PIN code display
- Copy PIN button
- Activation instructions (4 steps)
- Quick links box for support
- Order details section
- Footer with:
  - Contact links
  - Social media icons
  - Company info
  - Unsubscribe link

### 💬 WhatsApp Widget
- Floating circular button (bottom right)
- WhatsApp green color with pulse animation
- Tooltip on hover: "Need help? Chat with us!"
- Appears after 3 seconds on page load
- Hides/shows on scroll
- Opens WhatsApp with pre-filled message
- Mobile: Direct to WhatsApp app
- Desktop: Opens WhatsApp Web

### 🎨 Design System
**Colors:**
- Primary: Blue (#2563EB)
- Secondary: Green (#10B981)
- Accent: Orange (#F59E0B) - Vipps
- Success: Green (#22C55E)
- Error: Red (#EF4444)
- WhatsApp: Green (#25D366)

**Typography:**
- Font Family: Inter
- Headings: Bold, 32-48px
- Body: 16-18px
- Buttons: Semibold, 18px

**Components:**
- Primary buttons with gradient background
- Secondary buttons with border
- Cards with shadow and hover effects
- Toast notifications (top right)
- Loading spinners
- Form validation

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

1. **Clone or navigate to the project directory:**
```bash
cd "c:\Users\ASUS\Desktop\topup"
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser and visit:**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
topup/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Sticky navigation header
│   │   ├── Footer.jsx           # Footer with links
│   │   └── WhatsAppWidget.jsx   # Floating WhatsApp button
│   ├── pages/
│   │   ├── HomePage.jsx         # Landing page
│   │   ├── BundlesPage.jsx      # Product catalog
│   │   ├── ProductPage.jsx      # Product details
│   │   ├── CheckoutPage.jsx     # Checkout flow
│   │   └── ConfirmationPage.jsx # Order confirmation
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── email-template.html          # Email template for ePIN delivery
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## 🎯 Key Features Implementation

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu for mobile
- Collapsible sections
- Touch-friendly buttons (min 48px)

### Animations
- Fade-in page transitions
- Slide-up effects
- Button hover scale (1.02)
- Card hover lift (-4px)
- Pulse animation for WhatsApp button

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Alt text for images

### Performance
- Lazy loading components
- Optimized images
- Minimal bundle size
- Fast page transitions

## 🔧 Customization

### Update WhatsApp Number
Edit `src/components/WhatsAppWidget.jsx`:
```javascript
const whatsappNumber = '47XXXXXXXXX'; // Replace with your number
```

### Update Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: '#2563EB',
  secondary: '#10B981',
  // Add more custom colors
}
```

### Add More Products
Edit the bundles array in `src/pages/BundlesPage.jsx`

### Update Email Template
Edit `email-template.html` and update:
- Company name
- Contact information
- Support links
- Social media links

## 📱 Payment Integration

To integrate real payment providers:

1. **Vipps:** Visit [Vipps Developer](https://developer.vippsmobilepay.com/)
2. **Klarna:** Visit [Klarna Developers](https://developers.klarna.com/)
3. **Stripe (for cards):** Visit [Stripe Docs](https://stripe.com/docs)
4. **PayPal:** Visit [PayPal Developer](https://developer.paypal.com/)

## 📧 Email Delivery Setup

For automated email delivery:
1. Use services like SendGrid, Mailgun, or AWS SES
2. Set up email templates
3. Configure SMTP settings
4. Add email sending logic to backend

## 🛡️ Security Considerations

- Never store payment information
- Use HTTPS in production
- Validate all form inputs
- Sanitize user data
- Implement CSRF protection
- Use secure payment gateways

## 📦 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to GitHub Pages
```bash
npm run build
# Push dist folder to gh-pages branch
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons: [Lucide React](https://lucide.dev/)
- Fonts: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- CSS Framework: [Tailwind CSS](https://tailwindcss.com/)
- Build Tool: [Vite](https://vitejs.dev/)

## 📞 Support

For support, email support@easytopup.no or join our WhatsApp support.

---

Made with ❤️ by EasyTopup.no Team
