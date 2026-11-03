# Kelnix Market

Kelnix Market is a mobile-first storefront for practical digital products: downloadable guides, planners, business resources and templates.

## Storefront status

The current launch branch contains the responsive storefront experience and a pre-launch product catalogue. Product cards are intentionally marked as coming soon until the final PDF files, verified checkout route and delivery flow are configured.

## Add or publish products

The initial catalogue is defined in `src/App.tsx` in the `products` array. Each item includes:

- Product title and short description
- Category and planned launch price
- Product detail copy and cover-art palette
- A launch status label

Before publishing a product for sale, add its final PDF file to an appropriate storage provider, configure a verified payment flow, and connect successful payment to secure file delivery. Do not expose private file-storage credentials or rely on a public PDF URL for paid downloads.

## Local development

**Prerequisites:** Node.js 20 or newer.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` only if you are using the retained server/API features.
3. Configure only the credentials required by the feature being enabled. Never commit API keys, service-role keys, payment secrets or private access tokens.
4. Run locally: `npm run dev`
5. Build: `npm run build`

## Launch checklist

- [ ] Replace preview catalogue items with final PDF products.
- [ ] Upload files to private object storage.
- [ ] Verify Malawi merchant onboarding and international card acceptance with the chosen payment provider.
- [ ] Implement server-side payment verification and secure download delivery.
- [ ] Add terms, privacy, refund and contact information.
- [ ] Test checkout, mobile layout, download permissions and email delivery end-to-end.
- [ ] Only then remove the coming-soon state and advertise products as available.

## Design direction

Warm editorial design, forest-green typography, soft sage surfaces and electric-lime accents. The interface is responsive and designed for mobile-first browsing.
