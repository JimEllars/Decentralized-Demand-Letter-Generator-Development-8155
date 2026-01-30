import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiCreditCard, FiDownload, FiTrash2, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import Header from './components/Header';
import LetterForm from './components/LetterForm';
import DocumentPreview from './components/DocumentPreview';
import PaymentModal from './components/PaymentModal';
import { useLetterStore } from './hooks/useLetterStore';
import { processPayment } from './services/paymentService';
import { calculateTotal, getToneTemplate } from './utils/calculations';
import { generatePdfDefinition } from './services/pdfGenerator';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { generateId } from './utils/helpers';

if (pdfMake.vfs === undefined && pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

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

  const handleDownload = () => {
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
    pdfMake.createPdf(docDefinition).download(`AXiM_Demand_${formData.jurisdiction}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Header />
      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-fit">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider text-xs">
              <SafeIcon icon={FiFileText} /> Configuration
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-bold">
              <SafeIcon icon={FiTrash2} /> RESET DRAFT
            </button>
          </div>
          <LetterForm formData={formData} onUpdate={updateField} />
        </motion.section>

        <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-6">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl relative min-h-[600px] flex flex-col">
            {!isPaid && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="rotate-[-35deg] text-red-500/10 text-8xl font-black">PREVIEW ONLY</div>
              </div>
            )}
            <DocumentPreview formData={formData} isPaid={isPaid} />

            <div className="mt-6 space-y-3">
              {!isValid && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg text-xs flex items-center gap-2">
                  <SafeIcon icon={FiAlertCircle} />
                  Please complete all required fields to unlock/download.
                </div>
              )}

              {isPaid ? (
                <button
                  onClick={handleDownload}
                  disabled={!isValid}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
                >
                  <SafeIcon icon={FiDownload} /> DOWNLOAD COMPLIANT PDF
                </button>
              ) : (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!isValid}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform ${isValid ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] active:scale-[0.99]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                >
                  <SafeIcon icon={FiCreditCard} /> UNLOCK FOR $9.00
                </button>
              )}
            </div>
          </div>

          <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
            <div className="text-center sm:text-left">
              <h4 className="font-bold text-xl leading-tight">Need Other Documents?</h4>
              <p className="text-blue-200 text-sm opacity-90 mt-1">Check our template library for professional and affordable business documents.</p>
            </div>
            <button className="bg-white text-blue-900 px-6 py-3 rounded-lg text-sm font-black whitespace-nowrap hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
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