import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { processPayment, verifyPaymentSession } from '../services/paymentService';

const PAYMENT_STORAGE_KEY = 'axim_demand_letter_paid_status';

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
        if (data.isPaid) {
          setIsPaid(true);
          localStorage.setItem(PAYMENT_STORAGE_KEY, sessionId);
          if (isFromRedirect) {
            toast.success("Payment verified! You can now download your document.");
          }
        } else {
          // Clean up invalid session
          if (!isFromRedirect) {
            localStorage.removeItem(PAYMENT_STORAGE_KEY);
          }
        }
      } catch (err) {
        if (isFromRedirect) {
          toast.error("Payment verification failed.");
        }
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
    const savedSessionId = localStorage.getItem(PAYMENT_STORAGE_KEY);

    if (urlSessionId) {
      verifySession(urlSessionId, true);
    } else if (savedSessionId && savedSessionId !== 'true') {
      // If we have a stored session ID, verify it's still valid
      // Note: we ignore the old insecure 'true' value if it exists
      verifySession(savedSessionId, false);
    } else if (query.get('canceled') === 'true') {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const resetPayment = () => {
    localStorage.removeItem(PAYMENT_STORAGE_KEY);
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
    if (!isValid) {
      onError();
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processPayment(9.00);
      if (result.success) {
        setIsPaid(true);
        if (result.transactionId) {
          localStorage.setItem(PAYMENT_STORAGE_KEY, result.transactionId);
        }
        setShowPaymentModal(false);
        toast.success("Payment successful!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
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
