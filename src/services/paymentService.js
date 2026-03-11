/**
 * AXiM Payment Bridge
 * * To integrate a real provider:
 * 1. Set VITE_PAYMENT_API_URL in your .env file.
 */

/**
 * Initiates a transaction via the configured backend.
 * @param {string} apiUrl
 * @param {number} amount
 */
export const initiateBackendTransaction = async (apiUrl, amount) => {
  try {
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

    // Modern Stripe redirect: Just go directly to the Checkout URL provided by the backend
    if (data.url) {
      window.location.href = data.url;
      // Return a promise that never resolves to prevent UI state changes during redirect
      return new Promise(() => {});
    }

    if (data.success) {
      return data;
    }

    throw new Error('Invalid response from payment provider: Missing checkout url');
  } catch (error) {
    console.error("Payment Service Error:", error);
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
    setTimeout(() => {
      const mockResponse = {
        success: true,
        transactionId: `AXM-${Math.random().toString(36).toUpperCase().substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      
      resolve(mockResponse);
    }, 1500);
  });
};
