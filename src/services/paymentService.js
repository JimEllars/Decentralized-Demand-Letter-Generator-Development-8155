import { logSystemEvent } from '../utils/telemetry';

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
    logSystemEvent('checkout_exception', 'critical', { error: error.message, productId });
    throw error;
  }
};

export const processPayment = async (productId) => initiateBackendTransaction('/api', productId);

export const createCheckoutSession = async (formData, calculatedValues) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'demand_letter',
        formData,
        calculatedValues,
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/start?canceled=true`
      }),
    });
    if (!response.ok) throw new Error('Failed to create payment session');
    const data = await response.json();
    return data;
  } catch (error) {
    logSystemEvent('checkout_exception', 'critical', { error: error.message });
    throw error;
  }
};

export const verifyPaymentSession = async (sessionId) => {
  try {
    const response = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
    if (!response.ok) throw new Error('Failed to verify payment session');
    return await response.json();
  } catch (error) {
    logSystemEvent('verify_session_exception', 'high', { error: error.message, sessionId });
    throw error;
  }
};

export const deliverOrchestratedDocument = async (sessionId, formData, email, calculatedValues, toneTemplate) => {
  try {
    const response = await fetch(`/api/deliver-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, formData, email, calculatedValues, tone: toneTemplate })
    });
    if (!response.ok) throw new Error('Failed to deliver document');
    return await response.json();
  } catch (error) {
    logSystemEvent('deliver_document_exception', 'high', { error: error.message, sessionId });
    throw error;
  }
};

export const deliverDocumentViaEmail = async (email, base64Pdf, filename) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pdfData: base64Pdf, filename })
    });
    if (!response.ok) throw new Error('Failed to send email');
    return await response.json();
  } catch (error) {
    logSystemEvent('deliver_document_email_exception', 'high', { error: error.message });
    throw error;
  }
};
