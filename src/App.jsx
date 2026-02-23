import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiDownload, FiTrash2, FiAlertCircle, FiEdit3, FiLoader } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import Header from './components/Header';
import LetterForm from './components/LetterForm';
import SummaryCard from './components/SummaryCard';
import PaymentModal from './components/PaymentModal';
import Instructions from './components/Instructions';
import UpsellCard from './components/UpsellCard';
import { useLetterStore } from './hooks/useLetterStore';
import { useToast } from './contexts/ToastContext';
import { processPayment } from './services/paymentService';
import { calculateTotal, getToneTemplate } from './utils/calculations';
import { generatePdfDefinition } from './services/pdfGenerator';
import { generateId } from './utils/helpers';
import { validateForm, getFirstErrorFieldId } from './utils/validation';

const initialFormState = {
  jurisdiction: 'CA',
  tone: 'firm',
  creditorName: '',
  creditorAddress: '',
  debtorName: '',
  debtorAddress: '',
  items: [{ id: generateId(), description: 'Main Service Debt', amount: '' }],
  dueDate: '',
  letterDate: new Date().toISOString().split('T')[0],
  statutoryInterest: '',
};

const PAYMENT_STORAGE_KEY = 'axim_demand_letter_paid_status';

const App = () => {
  const { formData, updateField, resetForm: resetStore, isInitialized } = useLetterStore(initialFormState);
  const toast = useToast();
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Load payment status from storage
    const savedPaidStatus = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (savedPaidStatus === 'true') {
      setIsPaid(true);
    }

    // Check for payment parameters from Stripe redirect
    const query = new URLSearchParams(window.location.search);
    if (query.get('paid') === 'true') {
      setIsPaid(true);
      localStorage.setItem(PAYMENT_STORAGE_KEY, 'true');
      toast.success("Payment successful! You can now download your document.");
      // Clean up the URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (query.get('canceled') === 'true') {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const resetForm = () => {
    resetStore();
    localStorage.removeItem(PAYMENT_STORAGE_KEY);
    setIsPaid(false);
    toast.success("Form reset successfully.");
  };

  // Calculate Totals Live
  const calculatedValues = useMemo(() => {
    return calculateTotal(
      formData.items,
      formData.statutoryInterest,
      formData.dueDate,
      formData.jurisdiction,
      formData.letterDate
    );
  }, [formData]);

  const toneTemplate = useMemo(() => getToneTemplate(formData.tone), [formData.tone]);

  // Robust Validation Check
  const { isValid, errors } = useMemo(() => validateForm(formData), [formData]);

  const handleValidationFail = (errors) => {
    const firstErrorId = getFirstErrorFieldId(errors);
    if (firstErrorId) {
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
    toast.error("Please complete all required fields (marked in red).");
  };

  const handleProceedToCheckout = () => {
    if (!isValid) {
      handleValidationFail(errors);
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!isValid) {
      handleValidationFail(errors);
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

  const handleDownload = async () => {
    if (!isValid) {
      handleValidationFail(errors);
      return;
    }

    setIsDownloading(true);
    const docDefinition = generatePdfDefinition(formData, calculatedValues, toneTemplate, { watermark: !isPaid });

    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      // Handle both ESM and CJS exports
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
         pdfMake.vfs = pdfFonts.pdfMake.vfs;
      } else if (pdfFonts && pdfFonts.vfs) {
         pdfMake.vfs = pdfFonts.vfs;
      }

      const safeJurisdiction = (formData.jurisdiction || 'DEFAULT').replace(/[^a-zA-Z0-9]/g, '_');

      pdfMake.createPdf(docDefinition).download(`Demand_Letter_${safeJurisdiction}.pdf`);
      toast.success("Download started!");
    } catch (error) {
      console.error('Failed to load PDF generator:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Header />
      <main className="max-w-4xl mx-auto px-4 flex flex-col gap-8">

        {/* Instructions Section */}
        <Instructions />

        <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider text-xs">
              <SafeIcon icon={FiEdit3} /> Demand Letter Configuration
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-bold">
              <SafeIcon icon={FiTrash2} /> RESET FORM
            </button>
          </div>
          <LetterForm formData={formData} onUpdate={updateField} />
        </motion.section>

        {/* Live Financial Summary */}
        <SummaryCard calculatedValues={calculatedValues} jurisdiction={formData.jurisdiction} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
            <div className="space-y-3">
              {!isValid && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium">
                  <SafeIcon icon={FiAlertCircle} />
                  Please complete all required fields (highlighted in red) to proceed.
                </div>
              )}

              {isPaid ? (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-300 text-slate-500'}`}
                >
                  {isDownloading ? <FiLoader className="animate-spin" /> : <SafeIcon icon={FiDownload} />}
                  {isDownloading ? 'GENERATING PDF...' : 'DOWNLOAD COMPLIANT PDF'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={isDownloading}
                    className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-300 text-slate-500'}`}
                  >
                    <SafeIcon icon={FiCreditCard} /> PROCEED TO CHECKOUT ($9.00)
                  </button>
                  {isValid && (
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {isDownloading ? <FiLoader className="animate-spin" /> : <SafeIcon icon={FiDownload} />}
                      {isDownloading ? 'GENERATING PREVIEW...' : 'DOWNLOAD WATERMARKED PREVIEW'}
                    </button>
                  )}
                </>
              )}

              <div className="text-center text-xs text-slate-400 mt-2">
                Secure 256-bit SSL Encrypted Payment via Stripe
              </div>
            </div>

          <UpsellCard />
        </motion.section>
      </main>

      <AnimatePresence>
        {showPaymentModal && <PaymentModal isProcessing={isProcessing} onConfirm={handlePayment} onCancel={() => setShowPaymentModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
