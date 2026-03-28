import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from './common/SafeIcon';
import Header from './components/Header';
import Instructions from './components/Instructions';
import LetterForm from './components/LetterForm';
import SummaryCard from './components/SummaryCard';
import UpsellCard from './components/UpsellCard';
import PaymentModal from './components/PaymentModal';
import { useLetterStore } from './hooks/useLetterStore';
import { usePayment } from './hooks/usePayment';
import { usePdfGenerator } from './hooks/usePdfGenerator';
import { useToast } from './contexts/ToastContext';
import { calculateTotal, getToneTemplate } from './utils/calculations';
import { generateId, getLocalDateString } from './utils/helpers';
import { validateForm, getFirstErrorFieldId } from './utils/validation';

const getInitialState = () => ({
  jurisdiction: 'CA',
  tone: 'firm',
  creditorName: '',
  creditorAddress: '',
  debtorName: '',
  debtorAddress: '',
  items: [{ id: generateId(), description: 'Main Service Debt', amount: '' }],
  dueDate: '',
  letterDate: getLocalDateString(),
  statutoryInterest: '0',
});

const App = () => {
  const { formData, updateField, resetForm: resetStore, isInitialized } = useLetterStore(getInitialState);
  const toast = useToast();

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Custom hooks
  const {
    isPaid,
    isProcessing,
    showPaymentModal,
    setShowPaymentModal,
    handleProceedToCheckout,
    handlePayment,
    resetPayment
  } = usePayment();

  const { handleDownload: triggerDownload, isGenerating } = usePdfGenerator();

  const resetForm = () => {
    resetStore();
    resetPayment();
    setHasAttemptedSubmit(false);
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

  const displayedErrors = hasAttemptedSubmit ? errors : {};

  const onValidationFail = () => {
    setHasAttemptedSubmit(true);
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

  const onCheckoutClick = () => handleProceedToCheckout(isValid, onValidationFail);
  const onPaymentConfirm = () => handlePayment(isValid, onValidationFail);
  const onDownloadClick = () => triggerDownload(isValid, onValidationFail, formData, calculatedValues, toneTemplate, isPaid);

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
              <SafeIcon name="FiEdit3" /> Demand Letter Configuration
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-bold">
              <SafeIcon name="FiTrash2" /> RESET FORM
            </button>
          </div>
          <LetterForm formData={formData} onUpdate={updateField} errors={displayedErrors} />
        </motion.section>

        {/* Live Financial Summary */}
        <SummaryCard calculatedValues={calculatedValues} jurisdiction={formData.jurisdiction} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
            <div className="space-y-3">
              {!isValid && hasAttemptedSubmit && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium">
                  <SafeIcon name="FiAlertCircle" />
                  Please complete all required fields (highlighted in red) to proceed.
                </div>
              )}

              {isPaid ? (
                <>
                  <button
                    onClick={onDownloadClick}
                    disabled={isGenerating}
                    className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid && !isGenerating ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        GENERATING PDF...
                      </>
                    ) : (
                      <>
                        <SafeIcon name="FiDownload" /> DOWNLOAD COMPLIANT PDF
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SafeIcon name="FiTrash2" /> CLEAR DATA & RESET
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onCheckoutClick}
                    disabled={isProcessing}
                    className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid && !isProcessing ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <SafeIcon name="FiCreditCard" /> PROCEED TO CHECKOUT ($9.00)
                      </>
                    )}
                  </button>
                  {isValid && (
                    <button
                      onClick={onDownloadClick}
                      disabled={isGenerating}
                      className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? "GENERATING PREVIEW..." : <> <SafeIcon name="FiDownload" /> DOWNLOAD WATERMARKED PREVIEW </>}
                    </button>
                  )}
                </>
              )}

              <div className="text-center text-xs text-slate-400 mt-2">
                Secure 256-bit SSL Encrypted Payment via Stripe
              </div>
              <div className="text-center text-xs text-slate-500 font-bold mt-1">
                All sales are final. No refunds.
              </div>
            </div>

          <UpsellCard total={calculatedValues.total} />
        </motion.section>
      </main>

      <AnimatePresence>
        {showPaymentModal && <PaymentModal isProcessing={isProcessing} onConfirm={onPaymentConfirm} onCancel={() => setShowPaymentModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
