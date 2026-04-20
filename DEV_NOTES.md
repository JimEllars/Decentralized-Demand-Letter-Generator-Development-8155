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
