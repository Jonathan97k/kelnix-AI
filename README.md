# Kelnix Market

Kelnix Market is a mobile-first storefront for practical digital products: downloadable guides, planners, business resources and templates.

## Storefront status

The launch branch contains the responsive storefront experience and a pre-launch product catalogue. Product cards are intentionally marked as coming soon until final PDF files, a verified checkout route and secure delivery are configured.

## Add or publish products

The initial catalogue is defined in `src/App.tsx` in the `products` array. Each item includes its title, description, category, planned launch price, cover style and status label.

Before publishing a product for sale:
1. Upload the final PDF to private object storage.
2. Configure a payment provider that has verified merchant onboarding and payout support for the seller's actual country.
3. Verify payments server-side.
4. Deliver the purchased file through an expiring or authenticated download link.

Do not expose private storage credentials or link directly to paid PDFs from a public catalogue.

## Local development

Prerequisite: Node.js 20 or newer.

- Install: `npm install`
- Start: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run start`

The current storefront is a static Vite application. Legacy AI/API code from the former Kelnix AI application is retained separately and is not part of the active storefront runtime.

## Launch checklist

- [ ] Replace preview catalogue items with final PDF products.
- [ ] Upload files to private object storage.
- [ ] Verify Malawi merchant onboarding, international card acceptance and settlement with the chosen payment provider.
- [ ] Implement server-side payment verification and secure download delivery.
- [ ] Add terms, privacy, refund and contact information.
- [ ] Test checkout, mobile layout, download permissions and email delivery end-to-end.
- [ ] Only then remove the coming-soon state and advertise products as available.

## Design direction

Warm editorial design, forest-green typography, soft sage surfaces and electric-lime accents. The interface is responsive and designed for mobile-first browsing.
