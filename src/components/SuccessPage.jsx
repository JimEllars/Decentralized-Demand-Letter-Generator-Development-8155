import { logSystemEvent } from '../utils/telemetry';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLetterStore } from '../hooks/useLetterStore';
import { verifyPaymentSession, deliverDocumentViaEmail, deliverOrchestratedDocument } from '../services/paymentService';
import { calculateTotal } from '../utils/calculations';
import { TONE_TEMPLATES } from '../utils/constants';
import { FiCheckCircle, FiDownload, FiPlusCircle, FiMail, FiThumbsUp, FiThumbsDown, FiFileText } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { useLegalStatutes } from '../hooks/useLegalStatutes';

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
  const toast = useToast();
  const { formData, resetForm, isInitialized } = useLetterStore(DEFAULT_FORM_DATA);
  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(() => {
    const sessionId = searchParams.get('session_id');
    return sessionStorage.getItem(`axim_email_sent_${sessionId}`) === 'true';
  });
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  // Cleanup Blob URL on unmount to prevent mobile browser memory leaks
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBase64, setPdfBase64] = useState(null);

  // Prevent accidental tab closure before downloading
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Your document is not saved on our servers. If you leave before saving, it will be permanently lost.";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  const handleDownload = async (formData, calculatedValues, toneTemplate, overrideSessionId) => {
     setIsGenerating(true);
     try {
       const response = await fetch('/api/generate-demand-letter', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           session_id: overrideSessionId || searchParams.get('session_id'),
           formData,
           calculatedValues,
           tone: toneTemplate
         })
       });

       if (!response.ok) throw new Error('Failed to generate PDF');

       const blob = await response.blob();
       const reader = new FileReader();
       reader.readAsDataURL(blob);
       reader.onloadend = () => {
         setPdfBase64(reader.result.split(',')[1]);
       };
       const url = window.URL.createObjectURL(blob);
      setPdfBlobUrl(url);
       try {
         const a = document.createElement('a');
         a.style.display = 'none';
         a.href = url;
         a.download = `Demand_Letter_${(formData.debtorName || 'Final').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
         document.body.appendChild(a);
         a.click();
         // We intentionally DO NOT revoke the ObjectURL here so the 'View' button remains active.
       } catch (e) {
         console.warn("Auto-download prevented by browser", e);
       }
     } catch (err) {
       console.error("PDF download failed", err);
       toast.error("Failed to generate PDF. Please try again.");
     } finally {
       setIsGenerating(false);
     }
  };

  const { data: legalStatutes } = useLegalStatutes();

  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'failed'
  const hasVerified = useRef(false);


  useEffect(() => {
    if (!isInitialized || !legalStatutes) return;
    if (hasVerified.current) return;
    hasVerified.current = true;

    let isMounted = true;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      if (isMounted) {
        toast.error('Invalid checkout session.');
        setVerificationStatus('failed');
      }
      return;
    }

    const verifyAndDownload = async () => {
      let attempts = 0;
      let isPaid = false;

      // 24-Second Polling Loop to handle Stripe Webhook edge cases
      while (attempts < 12 && !isPaid) {
        try {
          const verifiedData = await verifyPaymentSession(sessionId);
          if (verifiedData?.isPaid) { isPaid = true; break; }
        } catch (err) { console.warn('Verification attempt ' + (attempts + 1) + ' failed'); }
        attempts++;
        if (!isPaid && attempts < 12 && isMounted) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!isMounted) return;

      try {
        if (isPaid) {
          // Cross-Device Privacy Guard
          if (!formData.creditorName && !formData.debtorName) {
            setVerificationStatus('mismatch');
            return; // Halt generation
          }

          setVerificationStatus('success');
          // Prevent duplicate Analytics events on page refresh
          const analyticsLockKey = `axim_tracked_${sessionId}`;
          if (!sessionStorage.getItem(analyticsLockKey)) {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'purchase', ecommerce: { items: [{ item_id: 'demand_letter', item_name: 'Demand Letter', price: 4.00 }] } });
            sessionStorage.setItem(analyticsLockKey, 'true');
          }
          localStorage.setItem('axim_demand_letter_paid_status', sessionId);

          const calculatedValues = calculateTotal(
            formData.items, formData.statutoryInterest, formData.dueDate,
            formData.jurisdiction, formData.letterDate, legalStatutes?.details || {}
          );
          const toneTemplate = TONE_TEMPLATES[formData.tone];

                    setTimeout(async () => {
            if (isMounted) {
              try {
                await handleDownload(formData, calculatedValues, toneTemplate, sessionId);
              } catch (err) {
                logSystemEvent('pdf_generation_failed', 'critical', { session_id: sessionId, error: err.message });
                console.error("PDF generation error:", err);
                if (setIsGenerating) setIsGenerating(false);
                toast.error('Failed to generate PDF automatically. Please try the manual download button or email delivery.');
              }
            }
          }, 1000);
        } else {
          logSystemEvent('payment_verification_timeout', 'warning', { session_id: sessionId });
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
  }, [isInitialized, legalStatutes, searchParams]);

  const handleDownloadAgain = async () => {
    if (pdfBlobUrl) {
      // Trigger local download using existing Blob in memory (Zero API Cost)
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = pdfBlobUrl;
      a.download = `Demand_Letter_${(formData.debtorName || 'Final').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 100);
    } else {
      // Fallback to API fetch if local memory was cleared
      try {
        const calculatedValues = calculateTotal(formData.items, formData.statutoryInterest, formData.dueDate, formData.jurisdiction, formData.letterDate, legalStatutes?.details || {});
        await handleDownload(formData, calculatedValues, TONE_TEMPLATES[formData.tone], searchParams.get('session_id'));
      } catch (err) {
        toast.error('Failed to regenerate PDF. Try the email delivery option instead.');
      }
    }
  };

  const handleCreateAnother = () => {
    resetForm();
    localStorage.removeItem('axim_demand_letter_paid_status');
    localStorage.removeItem('axim_demand_draft');
    sessionStorage.removeItem('axim_delivery_email');
    navigate('/start');
  };

  const [email, setEmail] = useState(() => sessionStorage.getItem('axim_delivery_email') || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const hasSentInitialEmail = useRef(false);

  const [feedbackState, setFeedbackState] = useState('idle'); // 'idle', 'rating', 'submitted'
  const [feedbackRating, setFeedbackRating] = useState(null); // 'up', 'down'
  const [feedbackComments, setFeedbackComments] = useState('');

  const submitFeedback = async (e) => {
    e?.preventDefault();
    if (!feedbackRating) return;

    setFeedbackState('submitted');
    const sessionId = searchParams.get('session_id');

    try {
      await fetch('/api/v1/telemetry/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: sessionId,
          rating: feedbackRating,
          comments: feedbackComments
        })
      });
      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  // Auto-send email if user provided one during checkout
  useEffect(() => {
    let isMounted = true;
    if (verificationStatus === 'success' && email && !hasSentInitialEmail.current && pdfBase64) {
      hasSentInitialEmail.current = true;
      const sendInitialEmail = async () => {
        if (!isMounted) return;
        setIsSendingEmail(true);
        try {
          const dynamicFilename = `Demand_Letter_${(formData.debtorName || 'Final').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          await deliverDocumentViaEmail(email, pdfBase64, dynamicFilename);
          if (isMounted) {
             toast.success(`Document automatically sent to ${email}`);
             const optIn = sessionStorage.getItem('axim_marketing_optin') === 'true';
             if (optIn) fetch('/api/v1/telemetry/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'lead_captured', email, source: 'demand_letter_generator' }) }).catch(() => {});
             sessionStorage.removeItem('axim_delivery_email');
             sessionStorage.removeItem('axim_marketing_optin');
          }
        } catch (err) {
          if (isMounted) { console.error('Auto-send error:', err); toast.info('Email delivery delayed. Please use the Download button below.'); }
        } finally {
          if (isMounted) setIsSendingEmail(false);
        }
      };
      sendInitialEmail();
    }
    return () => { isMounted = false; };
  }, [verificationStatus, email, toast, formData, searchParams, pdfBase64]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter a valid email address."); return; }
    if (!pdfBase64) { toast.error("Document is still encrypting, please wait a moment."); return; }

    setIsSendingEmail(true);
    try {
      const dynamicFilename = `Demand_Letter_${(formData.debtorName || 'Final').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      await deliverDocumentViaEmail(email, pdfBase64, dynamicFilename);
      toast.success(`Document securely sent to ${email}`);
      setEmailSentSuccessfully(true);
      sessionStorage.setItem(`axim_email_sent_${searchParams.get('session_id')}`, 'true');
      setEmail('');
    } catch (err) {
      logSystemEvent('email_delivery_failed', 'error', { email_target: email });
      toast.error('Email services offline. Please try downloading instead.');
    } finally { setIsSendingEmail(false); }
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
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
              <span className="text-red-500 text-3xl">✕</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-red-500">Verification Timeout</h2>
            <p className="text-zinc-400 mt-2 text-sm mb-6 px-4">We could not confirm your payment session within the expected window due to network latency. If your card was charged, your document is still safe.</p>

            <div className="bg-black/40 border border-white/5 p-4 rounded-sm w-full mb-6 text-left">
              <p className="text-[0.65rem] text-zinc-500 font-mono uppercase tracking-widest mb-1">Transaction ID Reference</p>
              <p className="text-xs text-zinc-300 font-mono break-all">{searchParams.get('session_id') || 'Unknown'}</p>
            </div>

            <div className="flex w-full gap-3">
              <button onClick={() => window.location.reload()} className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-sm font-medium text-sm">Retry</button>
              <a
                href={`mailto:support@axim.us.com?subject=Payment Timeout - Session: ${searchParams.get('session_id')}`}
                className="flex-1 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors rounded-sm font-medium text-sm flex items-center justify-center"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

        {verificationStatus === 'mismatch' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
              <span className="text-amber-500 text-3xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-amber-500">Privacy Lock Activated</h2>
            <p className="text-zinc-400 mt-2 text-sm mb-6 px-4">You are accessing this receipt from a different device or browser than the one used to draft the document. Because we use a strict Zero-Knowledge architecture, your data is never stored on our servers.</p>
            <div className="bg-black/40 border border-white/5 p-4 rounded-sm w-full mb-6 text-left">
              <p className="text-[0.65rem] text-zinc-500 font-mono uppercase tracking-widest mb-1">How to access your document</p>
              <p className="text-xs text-zinc-300">Please open this exact link on the original device you used to complete the checkout.</p>
            </div>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-axim-teal/10 rounded-full flex items-center justify-center mb-6 border border-axim-teal/20 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <SafeIcon icon={FiCheckCircle} className="w-10 h-10 text-axim-teal" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Payment Successful</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              Your compliant Demand Letter is generating.
              <span className="text-red-400 block mt-4 font-bold uppercase tracking-widest text-[0.7rem]">⚠️ Save This Document Immediately</span>
              <span className="text-zinc-400 block mt-1 mb-4 text-xs font-medium">For your privacy, we do not store your data. If you close this tab before saving, your document will be permanently deleted.</span>
              <span className="text-amber-400 block mt-2 font-semibold text-xs">iOS / Safari Users: Auto-downloads are often blocked. Please click 'Download Again' below.</span>
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
            <button
              onClick={() => {
                resetForm();
                navigate('/app/demand-generator');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-sm font-mono text-xs uppercase tracking-widest transition-all duration-200"
            >
              <span>+ Draft Another Letter</span>
            </button>

              <button
                onClick={() => window.open(pdfBlobUrl, '_blank')}
                disabled={!pdfBlobUrl || isGenerating}
                className="w-full px-6 py-4 bg-transparent border border-axim-teal text-axim-teal font-bold uppercase tracking-wide text-sm hover:bg-axim-teal hover:text-black transition-all duration-300 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                <SafeIcon icon={FiFileText} /> View / Print Document (Mobile Safe)
              </button>

              {emailSentSuccessfully ? (
                <div className="w-full mt-4 bg-axim-teal/10 p-4 rounded-lg border border-axim-teal/20 text-center text-sm text-axim-teal font-medium flex items-center justify-center gap-2">
                  <SafeIcon icon={FiCheckCircle} /> Document sent to your inbox!
                </div>
              ) : (
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
              )}

              <button
                onClick={handleCreateAnother}
                className="w-full px-6 py-4 bg-transparent border border-white/10 hover:bg-white/5 transition-colors duration-300 rounded-lg font-medium text-sm flex items-center justify-center gap-2 mt-2"
              >
                <SafeIcon icon={FiPlusCircle} />
                Create Another Letter
              </button>

              {/* Note: Decentralized Proof of Generation Badge was removed since Web3 features are dormant */}
              {/* To reactivate Web3 features, set VITE_ENABLE_WEB3=true in the environment. */}

              {/* Quality Feedback Micro-Survey */}
              {feedbackState !== 'submitted' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-black/20 border border-white/5 p-4 rounded-lg flex flex-col items-center gap-3"
                >
                  <p className="text-zinc-300 text-sm font-medium">How was your experience?</p>

                  {feedbackState === 'idle' ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setFeedbackRating('up');
                          setFeedbackState('rating');
                        }}
                        className="p-3 bg-white/5 hover:bg-axim-teal/20 hover:text-axim-teal transition-colors rounded-full text-zinc-400"
                        title="Good"
                      >
                        <SafeIcon icon={FiThumbsUp} />
                      </button>
                      <button
                        onClick={() => {
                          setFeedbackRating('down');
                          setFeedbackState('rating');
                        }}
                        className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-full text-zinc-400"
                        title="Needs Improvement"
                      >
                        <SafeIcon icon={FiThumbsDown} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={submitFeedback} className="w-full flex flex-col gap-2">
                      <textarea
                        value={feedbackComments}
                        onChange={(e) => setFeedbackComments(e.target.value)}
                        placeholder="Tell us what we can improve (optional)..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-axim-teal transition-colors resize-none h-20"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-axim-teal text-black font-semibold rounded-lg text-xs hover:bg-white transition-colors"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SuccessPage;
