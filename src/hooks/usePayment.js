import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { processPayment } from '../services/paymentService';

const PAYMENT_STORAGE_KEY = 'axim_demand_letter_paid_status';

export const usePayment = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // Load payment status from storage
    const savedPaidStatus = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (savedPaidStatus === 'true') {
      setIsPaid(true);
    }

    // Check for payment parameters from Stripe redirect
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');

    if (sessionId) {
      setIsProcessing(true);
      // Verify with your backend
      fetch(`${import.meta.env.VITE_PAYMENT_API_URL}/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.isPaid) {
            setIsPaid(true);
            localStorage.setItem(PAYMENT_STORAGE_KEY, 'true');
            toast.success("Payment verified! You can now download your document.");
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(err => {
          toast.error("Payment verification failed.");
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .finally(() => setIsProcessing(false));
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
