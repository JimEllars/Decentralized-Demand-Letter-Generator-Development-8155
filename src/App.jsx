import React, { useState, useMemo, useDeferredValue } from 'react';
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
  const deferredFormData = useDeferredValue(formData);

  // Defer validation while typing to improve performance, unless the user has attempted to submit
  // where we want immediate feedback for error corrections.
  const validationSource = hasAttemptedSubmit ? formData : deferredFormData;

  const validationData = useMemo(() => ({
    creditorName: validationSource.creditorName,
    creditorAddress: validationSource.creditorAddress,
    debtorName: validationSource.debtorName,
    debtorAddress: validationSource.debtorAddress,
    dueDate: validationSource.dueDate,
    letterDate: validationSource.letterDate,
    items: validationSource.items
  }), [
    validationSource.creditorName,
    validationSource.creditorAddress,
    validationSource.debtorName,
    validationSource.debtorAddress,
    validationSource.dueDate,
    validationSource.letterDate,
    validationSource.items
  ]);

  const { isValid, errors } = useMemo(() => validateForm(validationData), [validationData]);

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
    <div className="min-h-screen bg-bg-void text-white font-inter pb-20 relative">
      <Header />
      <main className="max-w-4xl mx-auto px-4 flex flex-col gap-8 relative z-10">

        {/* Instructions Section */}
        <Instructions />

        <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/40 border border-subtle rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-subtle flex justify-between items-center bg-black/60">
            <h2 className="font-inter font-semibold text-axim-gold text-sm tracking-wide flex items-center gap-2 uppercase">
              <SafeIcon name="FiEdit3" /> Demand Letter Configuration
            </h2>
            <button onClick={resetForm} className="font-inter text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 uppercase tracking-wider">
              <SafeIcon name="FiTrash2" /> Reset Form
            </button>
          </div>
          <div className="bg-black/20">
            <LetterForm formData={formData} onUpdate={updateField} errors={displayedErrors} />
          </div>
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
                    className={`w-full ${isValid && !isGenerating ? 'bg-axim-gold text-black border border-axim-gold shadow-[0_10px_20px_-10px_rgba(255,234,0,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(255,234,0,0.5)] hover:bg-white hover:border-white' : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'} px-8 py-4 font-bold uppercase tracking-[1.5px] text-[0.85rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
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
                    className="w-full py-3 rounded-sm font-mono text-xs flex items-center justify-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest border border-transparent hover:border-red-900/30"
                  >
                    <SafeIcon name="FiTrash2" /> CLEAR DATA & RESET
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onCheckoutClick}
                    disabled={isProcessing}
                    className={`w-full ${isValid && !isProcessing ? 'bg-axim-gold text-black border border-axim-gold shadow-[0_10px_20px_-10px_rgba(255,234,0,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(255,234,0,0.5)] hover:bg-white hover:border-white' : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'} px-8 py-4 font-bold uppercase tracking-[1.5px] text-[0.85rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <SafeIcon name="FiCreditCard" /> PROCEED TO CHECKOUT ($4.00)
                      </>
                    )}
                  </button>
                  {isValid && (
                    <button
                      onClick={onDownloadClick}
                      disabled={isGenerating}
                      className="w-full py-4 rounded-sm font-mono text-xs flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-glass border border-subtle hover:border-active transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      {isGenerating ? "GENERATING PREVIEW..." : <> <SafeIcon name="FiDownload" /> DOWNLOAD WATERMARKED PREVIEW </>}
                    </button>
                  )}
                </>
              )}

              <div className="text-center font-mono text-[0.65rem] text-zinc-500 tracking-widest mt-4 uppercase">
                Secure 256-bit SSL Encrypted Payment via Stripe
              </div>
              <div className="text-center font-mono text-[0.65rem] text-zinc-400 font-bold mt-1 tracking-widest uppercase">
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
