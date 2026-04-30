export const initiateBackendTransaction = async (apiUrl, productId) => {
  try {
    const response = await fetch(`/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/start?canceled=true`
      }),
    });
    if (!response.ok) throw new Error('Failed to create payment session');
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
      return { url: data.url };
    }
    return data;
  } catch (error) {
    throw error;
  }
};

export const processPayment = async (productId) => initiateBackendTransaction('/api', productId);

export const verifyPaymentSession = async (sessionId) => {
  const response = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
  if (!response.ok) throw new Error('Failed to verify payment session');
  return response.json();
};

export const deliverOrchestratedDocument = async (templateId, formData, email) => {
  const response = await fetch(`/api/functions/document-orchestrator`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, formData, email })
  });
  if (!response.ok) throw new Error('Failed to deliver orchestrated document');
  return response.json();
};