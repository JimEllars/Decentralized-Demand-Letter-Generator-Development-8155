import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFileText, FiCreditCard, FiDownload, FiTrash2, FiArrowRight } from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import Header from './components/Header';
import LetterForm from './components/LetterForm';
import DocumentPreview from './components/DocumentPreview';
import PaymentModal from './components/PaymentModal';
import { useLetterStore } from './hooks/useLetterStore';
import { processPayment } from './services/paymentService';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (pdfMake.vfs === undefined && pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

const initialFormState = {
  creditorName: 'AXiM Systems Client',
  creditorAddress: '123 Business Way, Suite 100\nNew York, NY 10001',
  debtorName: '',
  debtorAddress: '',
  debtAmount: '',
  dueDate: '',
  debtDescription: 'Unpaid professional services per Invoice #001',
  lateFees: '0.00',
  statutoryInterest: '0',
};

const App = () => {
  const { formData, updateField, resetForm } = useLetterStore(initialFormState);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const result = await processPayment(29.00);
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
    const total = (parseFloat(formData.debtAmount || 0) + parseFloat(formData.lateFees || 0)).toFixed(2);
    const docDefinition = {
      content: [
        { text: 'FORMAL DEMAND FOR PAYMENT', style: 'header', alignment: 'center' },
        { text: '\n\n' },
        { columns: [
          { stack: [{ text: 'FROM:', style: 'label' }, { text: formData.creditorName, bold: true }, { text: formData.creditorAddress }] },
          { stack: [{ text: 'DATE:', style: 'label', alignment: 'right' }, { text: new Date().toLocaleDateString(), alignment: 'right' }] }
        ]},
        { text: '\n' },
        { stack: [{ text: 'TO:', style: 'label' }, { text: formData.debtorName, bold: true }, { text: formData.debtorAddress }] },
        { text: '\nRE: NOTICE OF OVERDUE ACCOUNT', style: 'subheader' },
        { text: `\nDemand is hereby made for the immediate payment of the balance due regarding ${formData.debtDescription}.` },
        { text: '\n' },
        { table: { widths: ['*', 'auto'], body: [
          ['Description', 'Amount'],
          ['Principal Debt', `$${formData.debtAmount || '0.00'}`],
          ['Fees & Interest', `$${formData.lateFees || '0.00'}`],
          [{ text: 'TOTAL DUE', bold: true }, { text: `$${total}`, bold: true }]
        ]}},
        { text: `\nPayment must be received by ${formData.dueDate || 'immediately'}.` },
        { text: '\nSincerely,\n\n__________________________\n' + formData.creditorName },
        { text: '\n\nGenerated via AXiM Documents Automation', style: 'footer', alignment: 'center' }
      ],
      styles: { 
        header: { fontSize: 18, bold: true }, 
        subheader: { fontSize: 14, bold: true }, 
        label: { fontSize: 8, color: 'grey' },
        footer: { fontSize: 8, color: '#cccccc', margin: [0, 50, 0, 0] }
      }
    };
    pdfMake.createPdf(docDefinition).download(`AXiM_Doc_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden h-fit"
        >
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider text-xs">
              <SafeIcon icon={FiFileText} /> Information Input
            </h2>
            <button 
              onClick={resetForm} 
              className="text-slate-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-bold"
            >
              <SafeIcon icon={FiTrash2} /> RESET DRAFT
            </button>
          </div>
          <LetterForm formData={formData} onUpdate={updateField} />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl relative min-h-[600px] flex flex-col">
            {!isPaid && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none opacity-10">
                <div className="rotate-[-35deg] text-red-500 text-8xl font-black">PREVIEW ONLY</div>
              </div>
            )}
            
            <DocumentPreview formData={formData} isPaid={isPaid} />

            <div className="mt-6 space-y-3">
              {isPaid ? (
                <button 
                  onClick={handleDownload}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <SafeIcon icon={FiDownload} /> DOWNLOAD OFFICIAL DOCUMENT
                </button>
              ) : (
                <button 
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  <SafeIcon icon={FiCreditCard} /> UNLOCK DOCUMENT ($29.00)
                </button>
              )}
            </div>
          </div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10"
          >
            <div>
              <h4 className="font-bold text-xl leading-tight">Need more documents?</h4>
              <p className="text-blue-200 text-sm opacity-90 mt-1">Access our full vault of professional templates.</p>
            </div>
            <button className="bg-white text-blue-900 px-6 py-3 rounded-lg text-sm font-black whitespace-nowrap hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
              BROWSE CATALOG <SafeIcon icon={FiArrowRight} />
            </button>
          </motion.div>
        </motion.section>
      </main>

      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal 
            isProcessing={isProcessing} 
            onConfirm={handlePayment} 
            onCancel={() => setShowPaymentModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;