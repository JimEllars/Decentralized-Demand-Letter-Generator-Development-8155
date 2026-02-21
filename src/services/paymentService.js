import { loadStripe } from '@stripe/stripe-js';

/**
 * AXiM Payment Bridge
 * 
 * To integrate a real provider:
 * 1. Set VITE_PAYMENT_API_URL in your .env file.
 * 2. Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file (optional, but recommended for client-side redirection).
 * 3. The backend should return { sessionId: 'cs_test_...' } or { url: 'https://checkout.stripe.com/...' } or { success: true }.
 */

// Initialize Stripe if a key is provided
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

/**
 * Initiates a transaction via the configured backend.
 * @param {string} apiUrl
 * @param {number} amount
 */
const initiateBackendTransaction = async (apiUrl, amount) => {
  try {
    console.log(`AXiM Bridge: Initiating secure transaction for $${amount} via configured backend (${apiUrl})...`);

    const response = await fetch(`${apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create payment session');
    }

    const data = await response.json();

    // Prioritize Stripe.js redirection if configured and sessionId is present
    if (data.sessionId && stripePromise) {
       console.log("Redirecting to Stripe Checkout via SDK...");
       const stripe = await stripePromise;
       if (stripe) {
         const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
         if (error) {
           throw error;
         }
         // Return a promise that never resolves to prevent UI state changes during redirect
         return new Promise(() => {});
       }
    }

    // Fallback to URL redirection (also handles case where sessionId is present but key is missing)
    if (data.url) {
      console.log("Redirecting to payment provider via URL...");
      window.location.href = data.url;
      return new Promise(() => {});
    }

    // If sessionId was provided but we couldn't use it, and no URL fallback
    if (data.sessionId && !stripePromise) {
       throw new Error("Backend returned a session ID, but VITE_STRIPE_PUBLISHABLE_KEY is not configured in the frontend.");
    }

    if (data.success) {
      return data;
    }

    throw new Error('Invalid response from payment provider: Missing sessionId or url');
  } catch (error) {
    console.error("Payment Service Error:", error);
    // If a real backend is configured but fails, we throw to alert the user
    // instead of silently falling back to mock (which would give free access).
    throw error;
  }
};

/**
 * Processes a payment for the specified amount.
 *
 * If VITE_PAYMENT_API_URL is configured, it initiates a real transaction.
 * Otherwise, it falls back to a simulation mode for development/demo.
 *
 * @param {number} amount - The amount to charge (e.g., 9.00).
 * @returns {Promise<{success: boolean, transactionId?: string} | never>}
 */
export const processPayment = async (amount) => {
  const paymentApiUrl = import.meta.env.VITE_PAYMENT_API_URL;

  if (paymentApiUrl) {
    return initiateBackendTransaction(paymentApiUrl, amount);
  }

  // Fallback: Simulation Mode (No Backend Configured)
  return new Promise((resolve, reject) => {
    console.log(`AXiM Bridge: Initiating simulated transaction for $${amount}...`);
    
    setTimeout(() => {
      // Simulate a successful response from a payment provider
      const mockResponse = {
        success: true,
        transactionId: `AXM-${Math.random().toString(36).toUpperCase().substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      
      if (mockResponse.success) {
        resolve(mockResponse);
      } else {
        reject(new Error("The transaction was declined by the provider."));
      }
    }, 2000);
  });
};
