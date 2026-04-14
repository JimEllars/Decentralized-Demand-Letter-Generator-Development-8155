import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { processPayment, verifyPaymentSession, getValidAccessToken, clearAccessToken } from '../services/paymentService';

export const usePayment = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const toast = useToast();

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
        isRedirecting = true;
        return;
      }

      if (result && result.success) {
        if (result.transactionId) {
          // If simulating or not returning a direct redirect URL, simulate redirect
          isRedirecting = true;
          window.location.href = `/success?session_id=${result.transactionId}`;
        } else {
          // Fallback if no transactionId is provided
          setIsPaid(true);
          setShowPaymentModal(false);
          toast.success("Payment successful!");
        }
      }
    } catch (error) {
      toast.error(error.message);
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
