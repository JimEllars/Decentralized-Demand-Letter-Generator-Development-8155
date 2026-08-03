# Demand Letter Generator Development Notes

## Current Architecture (Stripe-Only)

The application currently relies exclusively on a fiat-based Stripe checkout system to generate revenue. All previous Web3, partner credit, and document vaulting features have been made dormant to prioritize core functionality and immediate revenue capture.

### Key Components

- **Payment Processing**: Handled by `src/services/paymentService.js` and `src/hooks/usePayment.js`. These components communicate with a secure Cloudflare Worker proxy (`worker.js`) to initiate and verify Stripe checkout sessions.
- **Frontend UI**: `src/components/PaymentModal.jsx` provides the checkout interface. `src/components/SuccessPage.jsx` handles the post-payment redirect, verifies the session, and triggers document download/delivery.
- **Security**: The backend proxy enforces strict route whitelisting, CORS, origin validation, and authorization header checks.

## Reactivating Web3 Features

If there is a strategic decision to reintroduce Web3 capabilities (e.g., decentralized proof of generation, partner credits, crypto payments), these features can be reactivated by setting the following environment variable:

```env
VITE_ENABLE_WEB3=true
```

### Areas Affected by `VITE_ENABLE_WEB3`

When Web3 features are re-enabled, the following components and logic paths will need to be reviewed and potentially updated to fully support the restored functionality:

- **`src/components/PaymentModal.jsx`**: Reintroduce UI elements for wallet connection and crypto payment options.
- **`src/hooks/usePayment.js`**: Re-enable fallback logic or alternative payment flows for Web3 transactions.
- **`src/components/DemandGenerator.jsx`**: Restore logic for handling Web3 payments and partner credits alongside Stripe.
- **`src/components/SuccessPage.jsx`**: Reintroduce the Decentralized Proof of Generation Badge and associated verifications.
- **`src/hooks/useAuth.js`**: Restore Web3 user session management and authentication flows.
- **`src/hooks/usePdfGenerator.js`**: Re-enable Ledger stamping and secure-artifacts vault API logic.
- **`src/components/Header.jsx`**: Restore UI elements for user vault and partner features.
- **`src/services/paymentService.js`**: Re-integrate any necessary Web3 payment bridging or simulation logic.

### Important Considerations

Before fully reactivating Web3 features, ensure that the corresponding backend infrastructure (e.g., smart contracts, ledger APIs, vault storage) is deployed, secure, and properly integrated. The current `worker.js` proxy may need updates to whitelist new routes or handle different authorization mechanisms required by the Web3 services.

## QA Process: State Handoff Verification

To ensure that the user's data persists correctly across the Stripe checkout redirect boundary, QA should perform the following checks:

1. **Email Handoff Check (Pre-redirect):**
   - Fill out the demand letter generator completely.
   - Click "Proceed to Checkout".
   - In the `PaymentModal`, check the "Email me the PDF" box and enter a valid test email address.
   - Open Developer Tools -> Application -> `sessionStorage`.
   - Click "Pay with Card". Before the redirect to Stripe occurs, verify that the `axim_delivery_email` key is set in `sessionStorage` with the correct email address.

2. **Email Delivery Check (Post-redirect):**
   - Complete the Stripe checkout (or use a test card/mock depending on environment).
   - Upon redirecting back to the `SuccessPage`, verify that the system automatically attempts to send the document to the entered email.
   - Verify that the `axim_delivery_email` key is subsequently cleared from `sessionStorage` after the automatic email trigger completes.

3. **Fallback Resiliency Check:**
   - In `SuccessPage.jsx`, simulate a PDF generation failure (e.g., temporarily throw an error in `handleDownload`).
   - Confirm that the "Generating PDF..." loading state forcefully clears (i.e. `isGenerating` becomes `false`), and a clear error toast appears, directing the user to use the email delivery option instead.

## Update: Production PDF Formatting & Success Page Enhancements

- **Success Page**: Added a reminder text on the \`SuccessPage.jsx\` to instruct users to check their Spam/Junk folders for their document.
- **Worker PDF Generation**:
  - Fixed a string interpolation template literal bug that was not parsing \`$XX.XX\` correctly for itemized debts.
  - Eliminated footer data and unneeded branding texts for full white-labeling.
  - Formatted the document layout dynamically using \`pdf-lib\`, introducing 1-inch margins and professional structural elements, such as sender info, date alignments, recipient info, centered 14pt bold titles, well-spaced lines, and proper signature lines to reflect FDCPA standards.

## Telemetry & UI Refinements (Task update)

- **Telemetry Activation**:
  - Implemented the `TELEMETRY_PAYLOAD` schema in `src/utils/telemetry.js`.
  - Added strict silent error telemetry triggers inside `src/services/paymentService.js` to securely catch critical/high exceptions (like `checkout_exception` or `verify_session_exception`) during the Stripe flow without blocking the user's UI.
  - Linked Cloudflare Edge worker proxy timeout failures to `ctx.waitUntil(reportToCore('edge_timeout', ...))` to track infrastructure hiccups.

- **UI UX Modernization**:
  - Refined `LetterForm.jsx` input boundaries using `p-4`, `rounded-md`, and `shadow-inner` coupled with `focus:ring-2` to create a more sophisticated, high-end enterprise aesthetic compared to the original basic border layout.
  - Form spacing improvements maintained under the strict <16ms block threshold by utilizing Tailwind utility structures instead of custom React transition logic.
- **Pricing Update**: Applied $2.00 limited-time promotional pricing override across DemandLanding.jsx, PaymentModal.jsx, and the worker proxy checkout instantiation.
- **Telemetry Updates**: Updated reportToCore event to generation_fault for pdf_engine_crash within worker.js. Verified checkout_exception telemetry exists natively in paymentService.js.
- **UI Polish**: Appended focus:ring-2 and transition-all duration-200 to inputs in LetterForm.jsx and LetterItem.jsx to increase focus state polish.

## Optimization & Stabilization Pass

- **Worker Proxy Asset Optimization**: Added `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` headers to all static resource responses in `worker.js` to leverage Cloudflare's global CDN and reduce main-thread load times. Dynamic API routes and telemetry endpoints strictly retain `no-store`.
- **Dashboard Resilience**: Wrapped `src/pages/Dashboard.jsx` main content area in an `<ErrorBoundary>` to prevent entire portal white-screening if downstream data drops.
- **Admin Telemetry Scaffolding**: Prepared a mocked UI grid layout in `src/components/admin/ContentAnalytics.jsx` using standard Tailwind structure to surface `checkout_exception` and `generation_fault` data during future sprints, adhering to the 95/5 stabilization strategy (5% new feature work).

## Optimization & Stabilization Pass

- **Worker Proxy Asset Optimization**: Added `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` headers to all static resource responses in `worker.js` to leverage Cloudflare's global CDN and reduce main-thread load times. Dynamic API routes and telemetry endpoints strictly retain `no-store`.
- **Dashboard Resilience**: Wrapped `src/pages/Dashboard.jsx` main content area in an `<ErrorBoundary>` to prevent entire portal white-screening if downstream data drops.
- **Admin Telemetry Scaffolding**: Prepared a mocked UI grid layout in `src/components/admin/ContentAnalytics.jsx` using standard Tailwind structure to surface `checkout_exception` and `generation_fault` data during future sprints, adhering to the 95/5 stabilization strategy (5% new feature work).

## Dashboard Vault & Local Persistence

- **Local Persistence Integration**: Extended `src/hooks/useLetterStore.js` with `useHistoryStore` which utilizes local storage to persist generated demand letter metadata safely to ensure purchase history remains intact.
- **Enterprise Dashboard Modernization**: Completed a premium UI modernization for `src/pages/Dashboard.jsx` using Tailwind CSS which now reads and displays the stored documents from local storage inside an enterprise 'Vault' layout.
- **Performance Fix**: Implemented React lazy and Suspense inside `src/App.jsx` to optimize bundle size for the Dashboard and Content Analytics routes, using a custom branded spinner to preserve edge performance and premium UX.
- **Payment Lifecycle Registration**: Modified `src/components/SuccessPage.jsx` to automatically deposit document metadata to the `useHistoryStore` upon successful verification.

## Security & Telemetry Sprint (Task Update)

- **Cloudflare Turnstile (CAPTCHA)**:
  - Integrated into `PaymentModal.jsx` using test Sitekey `1x00000000000000000000AA`.
  - The "Pay with Card" checkout button is securely disabled until the token is successfully generated.
  - Native script injection method was utilized to prevent bloated dependencies.

- **Admin Telemetry Data Pipeline**:
  - The mock UI in `src/components/admin/ContentAnalytics.jsx` was connected to a dynamic `fetch` pipeline targeting `/api/admin/telemetry-logs`.
  - A fallback mock object gracefully intercepts any fetch failures to keep the UI active during active endpoint development.

- **UX Loading States**:
  - Micro-loading 200ms delays coupled with a loading spinner overlay were added to step transitions in `src/components/DemandGenerator.jsx`.
  - This ensures users perceive deliberate and secure structural validations as they traverse the intake wizard.

## UX Modernization & Web3 Scaffolding (Task Update)

- **Dashboard UI/UX Modernization**:
  - Transformed `src/pages/Dashboard.jsx` into a premium "Vault".
  - Created a modern Tailwind CSS data grid to display saved documents and active drafts.
  - Implemented premium spacing and hover states (`hover:bg-zinc-50`, `transition-all duration-200`) alongside clean typography.
  - Added a distinct, beautiful "Empty State" with a clear CTA to start drafting if no documents exist.
  - Sourced both completed artifacts from `useHistoryStore` and active drafts from `useLetterStore`.

- **Web3 "Proof of Generation" Badge**:
  - Scaffolded a future Web3 feature in `src/components/SuccessPage.jsx`.
  - The badge highlights that a document's cryptographic hash can be stamped to the ledger.
  - Gated the UI securely behind the `VITE_ENABLE_WEB3 === 'true'` environment variable to ensure zero disruption to live Web2 traffic.

- **Cloudflare Edge Routing Reinforcement**:
  - Reviewed `src/App.jsx` to ensure `React.lazy` is correctly implemented for `Dashboard` and `ContentAnalytics` routes. This ensures optimal main bundle size and instant caching at the Edge.


## Admin KV Telemetry (feature/admin-kv-telemetry)

- **Task 1: Provisioned Cloudflare KV Binding (wrangler.jsonc)**
  - Added a new KV namespace binding for telemetry storage under `TELEMETRY_KV`.
- **Task 2: Routed Telemetry to KV (worker.js)**
  - Updated the telemetry endpoints (`/api/v1/telemetry`) to store incoming payloads in `env.TELEMETRY_KV` securely using a timestamp-based key `telemetry:${Date.now()}`.
- **Task 3: Built the Admin Retrieval Endpoint (worker.js)**
  - Created a new endpoint `GET /api/admin/telemetry-logs` which fetches up to 50 logs from `env.TELEMETRY_KV`.
  - Implemented an authorization check comparing `Authorization` header with `env.ADMIN_SECRET`.
  - Computed `systemHealth`, `checkout_exception`, and `generation_fault` from fetched parsed data.
- **Task 4: Connected Dashboard Data Link (ContentAnalytics.jsx)**
  - Updated `src/components/admin/ContentAnalytics.jsx` to fetch telemetry data passing an `Authorization` header containing `import.meta.env.VITE_ADMIN_SECRET` or fallback.

## Fix Cloudflare Build Error and Pricing Audit

- **Task 1: Fix Cloudflare Build Error**
  - Removed the `kv_namespaces` array block completely from `wrangler.jsonc` to resolve the [code: 10042] build error caused by the placeholder `YOUR_KV_NAMESPACE_ID`.
- **Task 2: Graceful Telemetry Fallback**
  - Updated `worker.js` to wrap all `env.TELEMETRY_KV.put()`, `env.TELEMETRY_KV.list()`, and `env.TELEMETRY_KV.get()` calls in a safety check (`if (env.TELEMETRY_KV) { ... } else { console.warn('KV not bound'); }`). This ensures that the worker falls back gracefully and does not throw a 500 error if the KV is missing.
- **Task 3: Strict Pricing Audit ($2.00 Override)**
  - Audited the promotional copy in `DemandLanding.jsx` and `PaymentModal.jsx`. Replaced promotional strings to ensure it exactly reads "originally $8 but the promotional price TODAY is $2". Verified `worker.js` and `paymentService.js` to ensure no 400 or 800 hardcoded amounts dictated pricing logic.

## SSO Header Scaffolding and UX Improvements (feature/sso-header-and-progress-ui)

- **Task 1: Implement the AXiM Ecosystem SSO Header**
  - Updated `src/components/Header.jsx` to include a dynamic 'Login' button in the top-right navigation.
  - Implemented an `isAuthenticated` React state that toggles the button text from "Login" to "Hi AXiM User" as scaffolding for the future AXiM Passport integration.
- **Task 2: UX Polish - Visual Progress Indicator**
  - Updated `src/components/DemandGenerator.jsx` to replace the old visual stepper with a sleek, thin Tailwind progress bar (`h-1 bg-axim-teal`).
  - This modern UX pattern aims to reduce form abandonment and ensure a responsive design across all devices.
- **Task 3: UX Polish - Loading States on Checkout**
  - Updated `src/components/PaymentModal.jsx` to change the "Confirm Purchase" (Pay with Card) button text to "Securing Session..." with a CSS spinner while the system awaits a proxy response from `createCheckoutSession`. This reduces user double-clicks and strengthens transaction integrity.
