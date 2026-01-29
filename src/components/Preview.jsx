import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCreditCard } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Preview = ({ formData, isPaid, onPay, onDownload }) => {
  const total = (parseFloat(formData.debtAmount || 0) + parseFloat(formData.lateFees || 0)).toFixed(2);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl relative min-h-[700px] flex flex-col">
        {!isPaid && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden flex items-center justify-center opacity-10">
            <div className="rotate-[-35deg] text-red-500 text-6xl font-black whitespace-nowrap">
              <div className="space-y-8">
                <p>PREVIEW MODE</p><p>PREVIEW MODE</p><p>PREVIEW MODE</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white w-full flex-grow p-8 text-slate-800 shadow-inner rounded-lg overflow-y-auto max-h-[500px] relative z-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-blue-900 border-b-2 border-blue-900 pb-3 inline-block">
              Formal Demand for Payment
            </h2>
          </div>

          <div className="flex justify-between text-sm mb-8">
            <div>
              <p className="font-bold text-slate-500 text-xs uppercase tracking-wide">FROM:</p>
              <p className="font-bold text-lg">{formData.creditorName}</p>
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{formData.creditorAddress}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-500 text-xs uppercase tracking-wide">DATE:</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="text-sm mb-8">
            <p className="font-bold text-slate-500 text-xs uppercase tracking-wide">TO:</p>
            <p className="font-bold text-lg">{formData.debtorName || '[Debtor Name]'}</p>
            <p className="whitespace-pre-wrap text-slate-600">{formData.debtorAddress || '[Debtor Address]'}</p>
          </div>

          <div className="mb-8">
            <p className="font-bold border-b border-slate-300 pb-2 mb-4 text-blue-900">RE: OVERDUE ACCOUNT - FINAL NOTICE</p>
            <p className="text-sm leading-relaxed mb-6">
              Demand is hereby made for the immediate payment of <strong>${total}</strong> regarding: {formData.debtDescription}.
            </p>
            
            <p className="text-sm leading-relaxed">
              This amount must be received no later than <strong className="text-blue-900">{formData.dueDate || '[Due Date]'}</strong>.
            </p>
          </div>

          <div className="mt-8 text-xs text-slate-400 border-t border-slate-200 pt-4">
            <p>Generated via AXiM Systems Architecture. Logic verified for Statutory Compliance.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 relative z-20">
          {isPaid ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onDownload} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg">
              <SafeIcon icon={FiDownload} className="w-5 h-5" /> Download Legal PDF
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onPay} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg">
              <SafeIcon icon={FiCreditCard} className="w-5 h-5" /> Unlock Document for $29.00
            </motion.button>
          )}
        </div>
      </div>

      {/* UPDATED UPSELL CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-blue-700/50"
      >
        <div>
          <h4 className="font-bold text-xl leading-tight">Need more documents?</h4>
          <p className="text-blue-200 text-sm opacity-90 mt-1">Access our full vault of professional legal templates.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          className="bg-white text-blue-900 px-6 py-3 rounded-lg text-sm font-black whitespace-nowrap hover:bg-blue-50 transition-all shadow-lg"
        >
          VIEW ALL DOC TEMPLATES
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Preview;