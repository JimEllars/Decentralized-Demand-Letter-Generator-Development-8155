import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiDownload, FiTrash2, FiArrowRight, FiAlertCircle, FiEdit3, FiLock } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import Header from './components/Header';
import LetterForm from './components/LetterForm';
import DocumentPreview from './components/DocumentPreview';
import PaymentModal from './components/PaymentModal';
import { useLetterStore } from './hooks/useLetterStore';
import { processPayment } from './services/paymentService';
import { calculateTotal, getToneTemplate } from './utils/calculations';
import { generatePdfDefinition } from './services/pdfGenerator';
import { generateId } from './utils/helpers';

const initialFormState = {
  jurisdiction: 'CA',
  tone: 'firm',
  creditorName: 'AXiM Systems Client',
  creditorAddress: '',
  debtorName: '',
  debtorAddress: '',
  items: [{ id: generateId(), description: 'Main Service Debt', amount: '' }],
  dueDate: '',
  statutoryInterest: '0',
};

const App = () => {
  const { formData, updateField, resetForm } = useLetterStore(initialFormState);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Check for payment success parameter from Stripe redirect
    const query = new URLSearchParams(window.location.search);
    if (query.get('paid') === 'true') {
      setIsPaid(true);
      // Clean up the URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Robust Validation Check
  const isValid = formData.creditorName?.trim() &&
                  formData.debtorName?.trim() &&
                  formData.debtorAddress?.trim() &&
                  formData.dueDate &&
                  formData.items && formData.items.length > 0 &&
                  formData.items.every(i => i.amount && parseFloat(i.amount) > 0);

  const handlePayment = async () => {
    if (!isValid) {
      alert("Please complete all required fields (marked in red) before unlocking the document.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processPayment(9.00);
      if (result.success) {
        setIsPaid(true);
        setShowPaymentModal(false);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!isValid) {
      alert("Please complete all required fields.");
      return;
    }

    const calculatedValues = calculateTotal(
      formData.items,
      formData.statutoryInterest,
      formData.dueDate,
      formData.jurisdiction
    );
    const tone = getToneTemplate(formData.tone);
    const docDefinition = generatePdfDefinition(formData, calculatedValues, tone);

    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      // Handle both ESM and CJS exports
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      if (pdfMake.vfs === undefined && pdfFonts && pdfFonts.pdfMake) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      pdfMake.createPdf(docDefinition).download(`AXiM_Demand_${formData.jurisdiction}.pdf`);
    } catch (error) {
      console.error('Failed to load PDF generator:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Header />
      <main className="max-w-4xl mx-auto px-4 flex flex-col gap-8">

        {/* Instructions Section */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left"
        >
           <div className="flex-1">
             <h2 className="font-bold text-lg text-slate-800 mb-2">How It Works</h2>
             <div className="flex flex-col md:flex-row gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                  <span>Enter Debt Details</span>
                </div>
                <div className="hidden md:block text-slate-300">|</div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                  <span>Secure Payment</span>
                </div>
                <div className="hidden md:block text-slate-300">|</div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                  <span>Instant Download</span>
                </div>
             </div>
           </div>
           <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-100 font-medium">
             <SafeIcon icon={FiLock} /> Zero-Knowledge Privacy
           </div>
        </motion.section>

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

        {/* Live Document Preview */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DocumentPreview items={formData.items} />
        </motion.section>

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
                  disabled={!isValid}
                  className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  <SafeIcon icon={FiDownload} /> DOWNLOAD COMPLIANT PDF
                </button>
              ) : (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!isValid}
                  className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  <SafeIcon icon={FiCreditCard} /> PROCEED TO CHECKOUT ($9.00)
                </button>
              )}

              <div className="text-center text-xs text-slate-400 mt-2">
                Secure 256-bit SSL Encrypted Payment via Stripe
              </div>
            </div>

          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-xl leading-tight">Need Other Documents?</h4>
              <p className="text-slate-300 text-sm opacity-90 mt-1">Check our template library for professional and affordable business documents.</p>
            </div>
            <button className="bg-white text-slate-900 px-6 py-3 rounded-lg text-sm font-black whitespace-nowrap hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2">
              TEMPLATE LIBRARY <SafeIcon icon={FiArrowRight} />
            </button>
          </motion.div>
        </motion.section>
      </main>

      <AnimatePresence>
        {showPaymentModal && <PaymentModal isProcessing={isProcessing} onConfirm={handlePayment} onCancel={() => setShowPaymentModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;