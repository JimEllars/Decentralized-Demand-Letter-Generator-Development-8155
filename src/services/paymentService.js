/**
 * AXiM Payment Bridge
 * 
 * To integrate a real provider:
 * 1. Set VITE_PAYMENT_API_URL in your .env file.
 * 2. The backend should return { url: 'https://checkout.stripe.com/...' } or { success: true }.
 */

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
      throw new Error('Failed to create payment session');
    }

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe Checkout
      console.log("Redirecting to payment provider...");
      window.location.href = data.url;

      // Return a promise that never resolves to prevent UI state changes during redirect
      return new Promise(() => {});
    } else if (data.success) {
      return data;
    } else {
      throw new Error('Invalid response from payment provider');
    }
  } catch (error) {
    console.error("Payment Service Error:", error);
    // If a real backend is configured but fails, we throw to alert the user
    // instead of silently falling back to mock (which would give free access).
    throw error;
  }
};

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
