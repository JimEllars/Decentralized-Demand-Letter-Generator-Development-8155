import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { processPayment, verifyPaymentSession, getValidAccessToken, clearAccessToken } from '../services/paymentService';

export const usePayment = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async (sessionId, isFromRedirect = false) => {
      setIsProcessing(true);
      try {
        const data = await verifyPaymentSession(sessionId);
        if (data.isPaid && data.accessToken) {
          setIsPaid(true);
          if (isFromRedirect) {
            toast.success("Payment verified! You can now download your document.");
          }
        } else {
          // Clean up invalid session
          clearAccessToken();
        }
      } catch (err) {
        if (isFromRedirect) {
          toast.error("Payment verification failed.");
        }
        clearAccessToken();
      } finally {
        setIsProcessing(false);
        if (isFromRedirect) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // Check for payment parameters from Stripe redirect
    const query = new URLSearchParams(window.location.search);
    const urlSessionId = query.get('session_id');
    const hasValidToken = !!getValidAccessToken();

    if (urlSessionId) {
      verifySession(urlSessionId, true);
    } else if (hasValidToken) {
      // If we have a valid token, we're paid
      setIsPaid(true);
    } else if (query.get('canceled') === 'true') {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const resetPayment = () => {
    clearAccessToken();
    setIsPaid(false);
  };

  const handleProceedToCheckout = (isValid, onError) => {
      if (!isValid) {
          onError();
          return;
      }
      setShowPaymentModal(true);
  };

  const handlePayment = async (isValid, onError) => {
    if (isProcessing) return; // Prevent double submission

    if (!isValid) {
      onError();
      return;
    }

    setIsProcessing(true);
    let isRedirecting = false;

    try {
      let timeoutId;
      const result = await Promise.race([
        processPayment('demand_letter'),
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Payment request timed out. Please try again.')), 15000);
        })
      ]);
      clearTimeout(timeoutId);

      if (result && result.url) {
        // A direct redirect to a payment provider is happening.
        window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'begin_checkout', ecommerce: { items: [{ item_id: 'demand_letter', item_name: 'Demand Letter' }] } });
        isRedirecting = true;
        return;
      }

    } catch (error) {
      if (error.message === 'NETWORK_DEGRADED') {
        toast.error("We are currently experiencing high volume or a network degradation. Your draft is securely saved locally. Please try generating your document again in a few minutes.", { duration: 10000 });
      } else {
        toast.error(error.message);
      }
    } finally {
      // Maintain loading state if we are redirecting
      if (!isRedirecting) {
        setIsProcessing(false);
      }
    }
  };

  return {
    isPaid,
    isProcessing,
    showPaymentModal,
    setShowPaymentModal,
    handleProceedToCheckout,
    handlePayment,
    resetPayment
  };
};
