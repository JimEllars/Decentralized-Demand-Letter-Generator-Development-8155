import { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import Header from './Header';
import Instructions from './Instructions';
import LetterForm from './LetterForm';
import SummaryCard from './SummaryCard';
import UpsellCard from './UpsellCard';
import PaymentModal from './PaymentModal';
import { useLetterStore } from '../hooks/useLetterStore';
import { usePayment } from '../hooks/usePayment';
import { useToast } from '../contexts/ToastContext';
import { useLegalStatutes } from '../hooks/useLegalStatutes';
import { calculateTotal, getToneTemplate, parseCurrency } from '../utils/calculations';
import { generateId, getLocalDateString } from '../utils/helpers';
import { validateForm, getFirstErrorFieldId } from '../utils/validation';
import { FiUser, FiDollarSign, FiEdit3, FiCheckCircle, FiChevronRight, FiChevronLeft, } from 'react-icons/fi';

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

const getActionButtonStyles = (isActive) => {
  const base = "w-full px-8 py-4 font-bold uppercase tracking-[1.5px] text-[0.85rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2";
  const active = "bg-axim-gold text-black border border-axim-gold shadow-[0_10px_20px_-10px_rgba(255,234,0,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(255,234,0,0.5)] hover:bg-white hover:border-white";
  const disabled = "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed";

  return `${base} ${isActive ? active : disabled}`;
};

const STEPS = [
  { id: 1, title: 'The Parties', icon: FiUser },
  { id: 2, title: 'The Debt', icon: FiDollarSign },
  { id: 3, title: 'Tone & Review', icon: FiEdit3 }
];

const DemandGenerator = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formData, updateField, resetForm: resetStore, isInitialized, currentStep, setStep } = useLetterStore(getInitialState);
  const toast = useToast();
  const navigate = useNavigate();
  const { data: legalStatutes } = useLegalStatutes();

  const calculatedValues = useMemo(() => {
    return calculateTotal(
      formData.items,
      formData.statutoryInterest,
      formData.dueDate,
      formData.jurisdiction,
      formData.letterDate,
      legalStatutes.details
    );
  }, [formData, legalStatutes.details]);

  const toneTemplate = useMemo(() => getToneTemplate(formData.tone), [formData.tone]);
















  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    isProcessing,
    setIsProcessing,
    showPaymentModal,
    setShowPaymentModal,
    handleProceedToCheckout,
    handlePayment,
    resetPayment
  } = usePayment();








  useEffect(() => {
    let timeoutId;
    if (!isInitialized) {
      timeoutId = setTimeout(() => {
        console.warn("Store initialization timed out, forcing redirect...");
        navigate('/start', { replace: true });
        // Alternatively, we could force a reload
        // window.location.reload();
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isInitialized, navigate]);

  useEffect(() => {
    if (searchParams.get('canceled') === 'true') {
      toast.info("Checkout was canceled. Your draft has been saved.");
      setSearchParams(params => {
        params.delete('canceled');
        return params;
      });
    }
  }, [searchParams, setSearchParams, toast]);

  const resetForm = () => {
    resetStore();
    resetPayment();
    setHasAttemptedSubmit(false);
    sessionStorage.removeItem('axim_delivery_email');
    toast.success("Form reset successfully.");
  };



  const deferredFormData = useDeferredValue(formData);
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

  // Step Validation
  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
       if (!formData.creditorName?.trim()) stepErrors.creditorName = true;
       if (!formData.creditorAddress?.trim()) stepErrors.creditorAddress = true;
       if (!formData.debtorName?.trim()) stepErrors.debtorName = true;
       if (!formData.debtorAddress?.trim()) stepErrors.debtorAddress = true;
    } else if (step === 2) {
       if (!formData.dueDate) stepErrors.dueDate = true;
       if (!formData.items || formData.items.length === 0) stepErrors.items = true;
       formData.items?.forEach(item => {
           if (!item.description?.trim() || !item.amount || (!item.amount || parseCurrency(item.amount) <= 0)) {
               stepErrors.items = true;
           }
       });
    }
    return Object.keys(stepErrors).length === 0;
  };

  const isCurrentStepValid = validateStep(currentStep);

  const handleNextStep = () => {
    if (isCurrentStepValid && currentStep < 3) {
      // Telemetry: Log step completion
      try {
        fetch('/api/v1/telemetry/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: `step_${currentStep}_completed`,
            sessionId: window.userSession?.id || 'anonymous',
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // Fire and forget
      } catch (e) {
        // Ignore telemetry errors
      }
      setStep(currentStep + 1);
    } else {
      setHasAttemptedSubmit(true);
      toast.error("Please complete all required fields for this step.");
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const onValidationFail = () => {
    setHasAttemptedSubmit(true);
    toast.error("Please complete all required fields (marked in red).");
  };

  const handleGenerate = (e) => {
    e?.preventDefault();

    // Pre-Checkout Guardrails
    if (!formData.creditorName || !formData.creditorAddress) {
      toast.error("Please provide your complete Name and Address in Step 1.");
      return;
    }
    if (!formData.debtorName || !formData.debtorAddress) {
      toast.error("Please provide the Debtor's complete Name and Address in Step 1.");
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      toast.error("Please add at least one debt item to the ledger in Step 2.");
      return;
    }
    if (!formData.jurisdiction) {
      toast.error("Please select a governing State Jurisdiction.");
      return;
    }

    // If all checks pass, open the Stripe modal
    setShowPaymentModal(true);
  };

  const onPaymentConfirm = async (deliveryEmail, marketingOptIn) => {
    setIsProcessing(true);
    try {
      sessionStorage.setItem('axim_calculated_values', JSON.stringify(calculatedValues));
      if (deliveryEmail) {
        sessionStorage.setItem('axim_delivery_email', deliveryEmail);
        sessionStorage.setItem('axim_marketing_optin', marketingOptIn ? 'true' : 'false');
      }
      await handlePayment(isValid, onValidationFail);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Payment gateway unavailable. Please try again.");
    } finally {
      // CRITICAL: Always release the UI lock
      setIsProcessing(false);
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
    <div className="min-h-screen bg-bg-void text-white font-inter pb-20 relative">
      <Header />

      <main className="max-w-3xl mx-auto px-4 flex flex-col gap-12 relative z-10">
        <div className="w-full flex flex-col gap-8">

        <Instructions />

        {/* Stepper Progress Indicator */}
        <div className="relative pt-4 pb-8">
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-zinc-800 rounded-full z-0 overflow-hidden">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-axim-teal"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <div className="relative z-10 flex justify-between">
                {STEPS.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2" onClick={() => step.id < currentStep && setStep(step.id)} style={{ cursor: step.id < currentStep ? 'pointer' : 'default' }}>
                            <motion.div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                    isActive ? 'border-axim-teal bg-black text-axim-teal' :
                                    isCompleted ? 'border-axim-teal bg-axim-teal text-black' :
                                    'border-zinc-700 bg-black text-zinc-500'
                                }`}
                                initial={false}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                            >
                                <SafeIcon icon={isCompleted ? FiCheckCircle : step.icon} className="w-4 h-4" />
                            </motion.div>
                            <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${isActive || isCompleted ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>

        <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/40 border border-subtle rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-subtle flex justify-between items-center bg-black/60">
            <h2 className="font-inter font-semibold text-axim-gold text-sm tracking-wide flex items-center gap-2 uppercase">
              <SafeIcon name="FiEdit3" /> Demand Letter Configuration
            </h2>
            <button onClick={resetForm} className="font-inter text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 uppercase tracking-wider">
              <SafeIcon name="FiTrash2" /> Reset Form
            </button>
          </div>

          <div className="bg-black/20 relative min-h-[400px]">
            <LetterForm
               formData={formData}
               onUpdate={updateField}
               errors={displayedErrors}
               calculatedValues={calculatedValues}
               currentStep={currentStep}
            />
          </div>

          <div className="p-5 border-t border-subtle bg-black/60 flex justify-between items-center">
             <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 font-bold uppercase tracking-wider text-xs rounded-sm flex items-center gap-2 transition-colors ${
                    currentStep === 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:bg-white/10'
                }`}
             >
                <SafeIcon icon={FiChevronLeft} /> Back
             </button>

             {currentStep < 3 ? (
                <button
                    onClick={handleNextStep}
                    disabled={!isCurrentStepValid}
                    className={`px-8 py-3 font-bold uppercase tracking-wider text-xs rounded-sm flex items-center gap-2 transition-all ${
                        isCurrentStepValid
                        ? 'bg-axim-teal text-black hover:bg-white'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                    }`}
                >
                    Next <SafeIcon icon={FiChevronRight} />
                </button>
             ) : (
                <div className="text-zinc-400 text-xs tracking-wider uppercase font-bold flex items-center gap-2">
                   <SafeIcon icon={FiCheckCircle} className="text-axim-teal" /> Ready for Review
                </div>
             )}
          </div>
        </motion.section>

        {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <SummaryCard calculatedValues={calculatedValues} jurisdiction={formData.jurisdiction} />
            </motion.div>
        )}

        {currentStep === 3 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
                <div className="space-y-3">
                {!isValid && hasAttemptedSubmit && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium">
                    <SafeIcon name="FiAlertCircle" />
                    Please complete all required fields (highlighted in red) to proceed.
                    </div>
                )}

        <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-white/10 gap-6">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium px-4 py-2 bg-black/20 rounded-full border border-white/5">
            <span className="text-axim-teal">✓</span> Draft auto-saved securely to your device
          </div>

          <div className="flex w-full sm:w-auto gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 font-mono text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all uppercase tracking-widest rounded-sm"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isProcessing || !isValid}
              className="w-full sm:w-auto px-8 py-4 bg-axim-teal text-black font-bold uppercase tracking-wide text-sm hover:bg-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "PROCESSING..." : "Generate Document"}
            </button>
          </div>
        </div>

                <div className="text-center font-mono text-[0.65rem] text-zinc-500 tracking-widest mt-4 uppercase">
                    Secure 256-bit SSL Encrypted Payment via Stripe
                </div>
                <div className="text-center font-mono text-[0.65rem] text-zinc-400 font-bold mt-1 tracking-widest uppercase">
                    Quality and Satisfaction Guaranteed.
                </div>
                <div className="text-center text-[0.6rem] text-zinc-500 mt-6 max-w-sm mx-auto leading-relaxed border-t border-white/5 pt-4">
                    <strong>Disclaimer:</strong> This tool generates formatted documents based on user input. It does not provide legal advice, nor does it create an attorney-client relationship. By proceeding, you agree you are acting on your own behalf.
                </div>
                </div>

            <UpsellCard total={calculatedValues.total} />
            </motion.section>
        )}

        </div>

        </main>


      <AnimatePresence>
        {showPaymentModal && <PaymentModal isProcessing={isProcessing} onConfirm={onPaymentConfirm} onCancel={() => setShowPaymentModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default DemandGenerator;
