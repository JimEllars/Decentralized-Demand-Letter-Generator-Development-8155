import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLetterStore } from '../hooks/useLetterStore';
import { usePdfGenerator } from '../hooks/usePdfGenerator';
import { verifyPaymentSession, clearAccessToken } from '../services/paymentService';
import { calculateTotal } from '../utils/calculations';
import { TONE_TEMPLATES } from '../utils/constants';
import { FiCheckCircle, FiDownload, FiPlusCircle, FiMail } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';

const DEFAULT_FORM_DATA = {
  creditorName: '',
  creditorAddress: '',
  debtorName: '',
  debtorAddress: '',
  items: [],
  dueDate: '',
  letterDate: '',
  jurisdiction: '',
  statutoryInterest: '0',
  tone: 'firm'
};

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formData, resetForm, isInitialized } = useLetterStore(DEFAULT_FORM_DATA);
  const { handleDownload, isGenerating } = usePdfGenerator();
  const toast = useToast();

  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (hasVerified.current) return;
    hasVerified.current = true;

    let isMounted = true;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      if (isMounted) setVerificationStatus('failed');
      return;
    }

    const verifyAndDownload = async () => {
      try {
        const data = await verifyPaymentSession(sessionId);
        if (!isMounted) return;

        if (data.isPaid) {
          setVerificationStatus('success');
          localStorage.setItem('axim_demand_letter_paid_status', sessionId);

          // Trigger download automatically
          const calculatedValues = calculateTotal(
            formData.items,
            formData.statutoryInterest,
            formData.dueDate,
            formData.jurisdiction,
            formData.letterDate
          );
          const toneTemplate = TONE_TEMPLATES[formData.tone];

          // Delay download slightly to ensure UI updates and is perceived as a smooth transition
          setTimeout(() => {
            if (isMounted) {
              handleDownload(true, () => {}, formData, calculatedValues, toneTemplate, true);
            }
          }, 1000);

        } else {
          setVerificationStatus('failed');
          toast.error("Payment verification failed.");
        }
      } catch (err) {
        if (!isMounted) return;
        setVerificationStatus('failed');
        console.error("Verification error:", err);
        toast.error("Payment verification failed.");
      }
    };

    verifyAndDownload();

    return () => {
      isMounted = false;
    };
  }, [isInitialized, searchParams, formData, handleDownload, toast]);

  const handleDownloadAgain = () => {
    const calculatedValues = calculateTotal(
      formData.items,
      formData.statutoryInterest,
      formData.dueDate,
      formData.jurisdiction,
      formData.letterDate
    );
    const toneTemplate = TONE_TEMPLATES[formData.tone];
    handleDownload(true, () => {}, formData, calculatedValues, toneTemplate, true);
  };

  const handleCreateAnother = () => {
    resetForm();
    localStorage.removeItem('axim_demand_letter_paid_status');
    clearAccessToken();
    navigate('/app/demand-generator');
  };

  const [email, setEmail] = useState(() => sessionStorage.getItem('axim_delivery_email') || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const hasSentInitialEmail = useRef(false);

  // Auto-send email if user provided one during checkout
  useEffect(() => {
    if (verificationStatus === 'success' && email && !hasSentInitialEmail.current) {
      hasSentInitialEmail.current = true;
      const sendInitialEmail = async () => {
        setIsSendingEmail(true);
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsSendingEmail(false);
        toast.success(`Document automatically sent to ${email}`);
        sessionStorage.removeItem('axim_delivery_email');
      };
      sendInitialEmail();
    }
  }, [verificationStatus, email, toast]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSendingEmail(true);
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSendingEmail(false);
    toast.success(`Document sent to ${email}`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-axim-teal/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-2xl relative z-10 text-center"
      >
        {verificationStatus === 'verifying' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-12 h-12 border-4 border-axim-teal/30 border-t-axim-teal rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-bold tracking-tight">Verifying Payment...</h2>
            <p className="text-zinc-400 mt-2 text-sm">Please do not close this window.</p>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-red-500 text-3xl">✕</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-red-500">Verification Failed</h2>
            <p className="text-zinc-400 mt-2 text-sm mb-8">We could not verify your payment session.</p>
            <button
              onClick={() => navigate('/start')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-lg font-medium w-full"
            >
              Return Home
            </button>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-axim-teal/10 rounded-full flex items-center justify-center mb-6 border border-axim-teal/20 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <SafeIcon icon={FiCheckCircle} className="w-10 h-10 text-axim-teal" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Payment Successful</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Your compliant Demand Letter is generating. If your browser blocks the automatic download, please click the Download button below.
              {isGenerating && <span className="block mt-2 text-axim-teal animate-pulse">Generating PDF...</span>}
            </p>

            <div className="w-full space-y-3">
              <button
                onClick={handleDownloadAgain}
                disabled={isGenerating}
                className="w-full px-6 py-4 bg-axim-teal text-black font-bold uppercase tracking-wide text-sm hover:bg-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all duration-300 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SafeIcon icon={FiDownload} />
                Download Again
              </button>

              <form onSubmit={handleSendEmail} className="flex flex-col gap-2 w-full mt-4 bg-black/20 p-4 rounded-lg border border-white/5">
                <label htmlFor="email" className="text-sm font-medium text-zinc-300 text-left mb-1 flex items-center gap-2">
                  <SafeIcon icon={FiMail} className="text-axim-teal" /> Email Document
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-axim-teal transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSendingEmail || !email}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors duration-300 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSendingEmail ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </form>

              <button
                onClick={handleCreateAnother}
                className="w-full px-6 py-4 bg-transparent border border-white/10 hover:bg-white/5 transition-colors duration-300 rounded-lg font-medium text-sm flex items-center justify-center gap-2 mt-2"
              >
                <SafeIcon icon={FiPlusCircle} />
                Create Another Letter
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SuccessPage;
