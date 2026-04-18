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
      try {
        const parsedUrl = new URL(data.url);
        const isTrustedStripeDomain = parsedUrl.hostname === 'stripe.com' || parsedUrl.hostname.endsWith('.stripe.com');
        if (parsedUrl.protocol !== 'https:' || !isTrustedStripeDomain) {
          throw new Error('Security Error: Invalid redirect URL');
        }
      } catch (err) {
        console.error("Security Validation Error:", err.message);
        throw new Error('Security Error: Invalid redirect URL');
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

  if (paymentApiUrl) {
    return initiateBackendTransaction(paymentApiUrl, productId);
  }

  const isProd = typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PROD !== 'undefined'
    ? import.meta.env.PROD
    : process.env.NODE_ENV === 'production';

  if (isProd) {
    throw new Error('Payment API URL is not configured in production environment.');
  }

  // Fallback: Simulation Mode (No Backend Configured)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const transactionId = `AXM-${crypto.randomUUID().toUpperCase().split('-')[0]}`;
      // Store pending transaction to ensure secure verification in simulation mode
      sessionStorage.setItem('axim_pending_transaction', transactionId);

      const mockResponse = {
        success: true,
        transactionId: transactionId,
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
const PAYMENT_TOKEN_KEY = 'axim_access_token';
const TOKEN_EXPIRY_KEY = 'axim_token_expiry';

// Simulation mode: Secure in-memory token storage to prevent PII/Token exposure in sessionStorage
let simulationTokenStore = null;

export const verifyPaymentSession = async (sessionId) => {
  const paymentApiUrl = typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_PAYMENT_API_URL
    : process.env.VITE_PAYMENT_API_URL;

  if (paymentApiUrl) {
    try {
      const response = await fetch(`${paymentApiUrl}/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      if (!response.ok) {
        throw new Error('Failed to verify payment session');
      }
      const data = await response.json();

      if (data.accessToken) {
        sessionStorage.setItem(PAYMENT_TOKEN_KEY, data.accessToken);
        sessionStorage.setItem(TOKEN_EXPIRY_KEY, data.expiresAt);
      }

      return data;
    } catch (error) {
      console.error("Payment Verification Error:", error);
      throw error;
    }
  }

  const isProd = typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PROD !== 'undefined'
    ? import.meta.env.PROD
    : process.env.NODE_ENV === 'production';

  if (isProd) {
    throw new Error('Payment API URL is not configured in production environment.');
  }

  // Fallback: Simulation Mode
  return new Promise((resolve) => {
    setTimeout(() => {
      const pendingTransaction = sessionStorage.getItem('axim_pending_transaction');
      const isValid = typeof sessionId === 'string' &&
                      sessionId.startsWith('AXM-') &&
                      sessionId === pendingTransaction;

      if (isValid) {
        // Prevent replay attacks by clearing the pending transaction once verified
        sessionStorage.removeItem('axim_pending_transaction');

        const mockToken = `dev-token-${crypto.randomUUID()}`;
        const mockExpiry = new Date(Date.now() + 3600000).toISOString();

        // Use in-memory store for simulation mode instead of sessionStorage
        simulationTokenStore = {
          token: mockToken,
          expiry: mockExpiry
        };

        resolve({ isPaid: true, accessToken: mockToken, expiresAt: mockExpiry });
      } else {
        resolve({ isPaid: false });
      }
    }, 500);
  });
};

export const getValidAccessToken = () => {
  const isProd = typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.PROD !== 'undefined'
    ? import.meta.env.PROD
    : process.env.NODE_ENV === 'production';

  // Prioritize in-memory simulation token
  let token = null;
  let expiry = null;

  if (!isProd) {
    token = simulationTokenStore?.token;
    expiry = simulationTokenStore?.expiry;
  }

  // Fallback to sessionStorage for real production tokens
  if (!token || !expiry) {
    token = sessionStorage.getItem(PAYMENT_TOKEN_KEY);
    expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
  }

  if (!token || !expiry) return null;

  if (new Date(expiry) <= new Date()) {
    clearAccessToken();
    return null;
  }

  return token;
};

export const clearAccessToken = () => {
  simulationTokenStore = null;
  sessionStorage.removeItem(PAYMENT_TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * Delivers the document to the user via the AXiM Core Orchestrator.
 * @param {string} templateId - The ID of the document template.
 * @param {Object} formData - The data used to generate the document.
 * @param {string} email - The email address to send the document to.
 * @returns {Promise<Object>} The response from the orchestrator.
 */
export const deliverOrchestratedDocument = async (templateId, formData, email) => {
  const token = getValidAccessToken();
  const response = await fetch('https://api.axim.us.com/v1/functions/document-orchestrator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ templateId, formData, email })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const error = new Error('Your secure session has expired.');
      error.status = response.status;
      throw error;
    }
    throw new Error('Failed to deliver orchestrated document');
  }

  return response.json();
};
