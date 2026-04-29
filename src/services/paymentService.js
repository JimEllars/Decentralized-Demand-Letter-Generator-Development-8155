/**
 * AXiM Payment Bridge
 * * To integrate a real provider:
 * 1. Set VITE_PAYMENT_API_URL in your .env file.
 *
 * Note: Web3 payment and partner credit features are dormant. This service exclusively handles Stripe checkout.
 * To reactivate Web3 features, set VITE_ENABLE_WEB3=true in the environment.
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
      body: JSON.stringify({
        productId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/start?canceled=true`
      }),
    });

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('NETWORK_DEGRADED');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create payment session');
    }

    const data = await response.json();

    // Modern Stripe redirect: Just go directly to the Checkout URL provided by the backend
    if (data.url) {
      try {
        const parsedUrl = new URL(data.url);
        const isTrustedStripeDomain = parsedUrl.hostname === 'stripe.com' || parsedUrl.hostname.endsWith('.stripe.com');
        if (parsedUrl.protocol !== 'https:' || !isTrustedStripeDomain) {
          throw new Error('Security Error: Invalid redirect URL');
        }
      } catch (err) {
        console.error("Security Validation Error:", err.message);
        throw new Error('Security Error: Invalid redirect URL'); // eslint-disable-line
      }

      window.location.href = data.url;
      // Return the URL and let the caller maintain the UI loading state during redirect
      return { url: data.url };
    }

    if (data.success) {
      return data;
    }

    throw new Error('Invalid response from payment provider: Missing checkout url');
  } catch (error) {
    console.error("Payment Service Error:", error);
    if (error.message === 'NETWORK_DEGRADED' || error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      throw new Error('NETWORK_DEGRADED'); // eslint-disable-line
    }
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
  const paymentApiUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_PAYMENT_API_URL
    : process.env.VITE_PAYMENT_API_URL;

  if (!paymentApiUrl) {
    throw new Error('Payment API URL is not configured.');
  }

  return initiateBackendTransaction(paymentApiUrl, productId);
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
  try {
    const response = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error verifying payment session:', error);
    throw error;
  }
};

/**
 * Delivers the document to the user via the proxy.
 * @param {string} templateId - The ID of the document template.
 * @param {Object} formData - The data used to generate the document.
 * @param {string} email - The email address to send the document to.
 * @returns {Promise<Object>} The response from the orchestrator.
 */
export const deliverOrchestratedDocument = async (templateId, formData, email) => {
  const paymentApiUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_PAYMENT_API_URL
    : process.env.VITE_PAYMENT_API_URL;

  const baseUrl = paymentApiUrl || '/api';

  const response = await fetch(`${baseUrl}/functions/document-orchestrator`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ templateId, formData, email })
  });

  if (!response.ok) {
    throw new Error('Failed to deliver orchestrated document');
  }

  return response.json();
};
