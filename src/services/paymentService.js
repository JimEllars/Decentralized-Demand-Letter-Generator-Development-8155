/**
 * AXiM Payment Bridge
 * * To integrate a real provider:
 * 1. Set VITE_PAYMENT_API_URL in your .env file.
 */

/**
 * Initiates a transaction via the configured backend.
 * @param {string} apiUrl
 * @param {string} productId
 */
export const initiateBackendTransaction = async (apiUrl, productId) => {
  try {
    const response = await fetch(`${apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
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
 * Processes a payment for the specified product.
 *
 * If VITE_PAYMENT_API_URL is configured, it initiates a real transaction.
 * Otherwise, it falls back to a simulation mode for development/demo.
 *
 * @param {string} productId - The product ID to charge for (e.g., 'demand_letter').
 * @returns {Promise<{success: boolean, transactionId?: string} | never>}
 */
export const processPayment = async (productId) => {
  const paymentApiUrl = typeof import.meta.env !== 'undefined'
    ? import.meta.env.VITE_PAYMENT_API_URL
    : process.env.VITE_PAYMENT_API_URL;

  if (paymentApiUrl) {
    return initiateBackendTransaction(paymentApiUrl, productId);
  }

  const isProd = typeof import.meta.env !== 'undefined' && typeof import.meta.env.PROD !== 'undefined'
    ? import.meta.env.PROD
    : process.env.NODE_ENV === 'production';

  if (isProd) {
    throw new Error('Payment API URL is not configured in production environment.');
  }

  // Fallback: Simulation Mode (No Backend Configured)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockResponse = {
        success: true,
        transactionId: `AXM-${crypto.randomUUID().toUpperCase().split('-')[0]}`,
        timestamp: new Date().toISOString()
      };
      
      resolve(mockResponse);
    }, 1500);
  });
};

/**
 * Verifies a payment session ID via the configured backend.
 *
 * If VITE_PAYMENT_API_URL is configured, it sends a verification request.
 * Otherwise, it falls back to a simulation mode where session IDs starting with 'AXM-' are considered valid.
 *
 * @param {string} sessionId - The session ID to verify.
 * @returns {Promise<{isPaid: boolean} | never>}
 */
export const verifyPaymentSession = async (sessionId) => {
  const paymentApiUrl = typeof import.meta.env !== 'undefined'
    ? import.meta.env.VITE_PAYMENT_API_URL
    : process.env.VITE_PAYMENT_API_URL;

  if (paymentApiUrl) {
    try {
      const response = await fetch(`${paymentApiUrl}/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      if (!response.ok) {
        throw new Error('Failed to verify payment session');
      }
      return await response.json();
    } catch (error) {
      console.error("Payment Verification Error:", error);
      throw error;
    }
  }

  const isProd = typeof import.meta.env !== 'undefined' && typeof import.meta.env.PROD !== 'undefined'
    ? import.meta.env.PROD
    : process.env.NODE_ENV === 'production';

  if (isProd) {
    throw new Error('Payment API URL is not configured in production environment.');
  }

  // Fallback: Simulation Mode
  return new Promise((resolve) => {
    setTimeout(() => {
      const isValid = typeof sessionId === 'string' && sessionId.startsWith('AXM-');
      resolve({ isPaid: isValid });
    }, 500);
  });
};
