import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCheckCircle, FiAlertCircle, FiCopy, FiCheck } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const SummaryCard = ({ calculatedValues, jurisdiction }) => {
  const { principal, interest, total, formattedPrincipal, formattedInterest, formattedTotal, rateUsed, daysOverdue, statuteUsed } = calculatedValues;
  const [copied, setCopied] = useState(false);

  if (principal <= 0) {
    return null;
  }

  const handleCopy = () => {
    const text = `Demand Summary (${jurisdiction}):\nPrincipal: ${formattedPrincipal}\nInterest: ${formattedInterest} (${rateUsed}% via ${statuteUsed})\nTotal Recoverable: ${formattedTotal}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider text-xs">
          <SafeIcon icon={FiTrendingUp} /> Financial Summary
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded">
            {jurisdiction} Law Applied
          </span>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-blue-500 transition-colors"
            title="Copy Summary to Clipboard"
          >
            {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
          </button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">

        {/* Principal */}
        <div className="space-y-1 text-center md:text-left">
          <p className="text-xs font-bold text-slate-400 uppercase">Principal Amount</p>
          <p className="text-xl font-bold text-slate-800">{formattedPrincipal}</p>
        </div>

        {/* Interest Calculation */}
        <div className="space-y-1 text-center md:text-left md:pl-6 pt-4 md:pt-0">
          <p className="text-xs font-bold text-slate-400 uppercase flex items-center justify-center md:justify-start gap-1">
            Statutory Interest
            {daysOverdue > 0 && <span className="text-emerald-600 bg-emerald-50 px-1.5 rounded text-[10px]">{daysOverdue} Days</span>}
          </p>
          <p className="text-xl font-bold text-emerald-600">{formattedInterest}</p>
          <p className="text-[10px] text-slate-500 mt-1 leading-tight">
            {rateUsed}% per annum via <span className="italic">{statuteUsed}</span>
          </p>
          {daysOverdue <= 0 && (
             <p className="text-[10px] text-amber-500 mt-1 flex items-center justify-center md:justify-start gap-1">
               <SafeIcon icon={FiAlertCircle} /> No overdue days calculated
             </p>
          )}
        </div>

        {/* Total Due */}
        <div className="space-y-1 text-center md:text-right md:pl-6 pt-4 md:pt-0 bg-blue-50/50 -mx-6 px-6 md:mx-0 md:px-0 md:bg-transparent rounded-b-2xl md:rounded-none flex flex-col justify-center">
          <p className="text-xs font-bold text-blue-400 uppercase">Total Recoverable</p>
          <p className="text-3xl font-black text-blue-900">{formattedTotal}</p>
        </div>

      </div>
    </motion.div>
  );
};

export default SummaryCard;
