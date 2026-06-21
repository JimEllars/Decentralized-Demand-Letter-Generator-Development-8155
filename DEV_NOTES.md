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
