import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const SummaryCard = ({ calculatedValues, jurisdiction }) => {
  const { principal, interest, total, formattedPrincipal, formattedInterest, formattedTotal, rateUsed, daysOverdue, statuteUsed } = calculatedValues;

  if (principal <= 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass rounded-sm shadow-lg border border-subtle overflow-hidden backdrop-blur-sm"
    >
      <div className="bg-black/40 border-b border-subtle px-6 py-4 flex items-center justify-between">
        <h3 className="font-mono text-axim-gold text-[0.7rem] uppercase tracking-widest flex items-center gap-2">
          <SafeIcon icon={FiTrendingUp} /> Financial Summary
        </h3>
        <span className="font-mono text-[0.65rem] text-axim-teal bg-black border border-subtle px-2 py-1 uppercase tracking-widest">
          {jurisdiction} Law Applied
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-subtle">

        {/* Principal */}
        <div className="space-y-1 text-center md:text-left">
          <p className="font-mono text-[0.65rem] text-zinc-400 uppercase tracking-widest">Principal Amount</p>
          <p className="text-xl font-mono text-white">{formattedPrincipal}</p>
        </div>

        {/* Interest Calculation */}
        <div className="space-y-1 text-center md:text-left md:pl-6 pt-4 md:pt-0">
          <p className="font-mono text-[0.65rem] text-zinc-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
            Statutory Interest
            {daysOverdue > 0 && <span className="text-axim-teal bg-black border border-subtle px-1.5 py-0.5 text-[0.6rem]">{daysOverdue} Days</span>}
          </p>
          <p className="text-xl font-mono text-axim-teal">{formattedInterest}</p>
          <p className="font-mono text-[0.65rem] text-zinc-500 mt-1 leading-tight tracking-wide">
            {rateUsed}% per annum via <span className="italic text-zinc-400">{statuteUsed}</span>
          </p>
          {daysOverdue <= 0 && (
             <p className="font-mono text-[0.65rem] text-amber-500 mt-1 flex items-center justify-center md:justify-start gap-1 tracking-wide">
               <SafeIcon icon={FiAlertCircle} /> No overdue days calculated
             </p>
          )}
        </div>

        {/* Total Due */}
        <div className="space-y-1 text-center md:text-right md:pl-6 pt-4 md:pt-0 bg-black/20 -mx-6 px-6 md:mx-0 md:px-0 md:bg-transparent flex flex-col justify-center">
          <p className="font-mono text-[0.65rem] text-axim-gold uppercase tracking-widest">Total Recoverable</p>
          <p className="text-3xl font-black font-mono text-axim-gold">{formattedTotal}</p>
        </div>

      </div>
    </motion.div>
  );
};

export default SummaryCard;
