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
      transition={{ duration: 0.3 }}
      key={`${principal}-${interest}-${jurisdiction}`}
      className="bg-black/50 rounded-xl shadow-lg border border-subtle overflow-hidden relative watermark-bg sm:p-2"
      aria-live="polite"
      role="region"
      aria-label="Financial Summary"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-axim-teal to-axim-gold opacity-50 z-10"></div>
      <div className="bg-black/60 border-b border-subtle px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-2 sm:gap-0">
        <h3 className="font-inter font-semibold text-axim-gold text-sm tracking-wide flex items-center gap-2 uppercase">
          <SafeIcon icon={FiTrendingUp} /> Financial Summary
        </h3>
        <span className="font-inter font-semibold text-[0.65rem] text-axim-teal bg-axim-teal/10 border border-axim-teal/20 px-2 py-1 uppercase tracking-widest rounded-sm self-start sm:self-auto">
          {jurisdiction} Law Applied
        </span>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4 lg:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-subtle relative z-10">

        {/* Principal */}
        <div className="space-y-1 text-left sm:pr-4">
          <p className="font-inter font-medium text-[0.65rem] text-zinc-400 uppercase tracking-wider">Principal Amount</p>
          <p className="text-xl sm:text-2xl font-mono text-white font-medium">{formattedPrincipal}</p>
        </div>

        {/* Interest Calculation */}
        <div className="space-y-1 text-left pt-4 sm:pt-0 sm:pl-4 lg:pl-6">
          <p className="font-inter font-medium text-[0.65rem] text-zinc-400 uppercase tracking-wider flex items-center justify-start gap-1">
            Statutory Interest
            {daysOverdue > 0 && <span className="text-axim-teal bg-axim-teal/10 border border-axim-teal/20 px-1.5 py-0.5 text-[0.6rem] rounded-sm">{daysOverdue} Days</span>}
          </p>
          <p className="text-xl sm:text-2xl font-mono text-axim-teal font-medium">{formattedInterest}</p>
          <p className="font-inter text-[0.65rem] text-zinc-500 mt-1 leading-tight tracking-wide">
            {rateUsed}% per annum via <span className="italic text-zinc-400">{statuteUsed}</span>
          </p>
          {daysOverdue <= 0 && (
             <p className="font-inter font-medium text-[0.65rem] text-amber-500 mt-1 flex items-center justify-start gap-1 tracking-wide">
               <SafeIcon icon={FiAlertCircle} /> No overdue days calculated
             </p>
          )}
        </div>

        {/* Total Due */}
        <div className="space-y-1 text-left sm:text-right sm:col-span-2 lg:col-span-1 pt-4 lg:pt-0 lg:pl-6 flex flex-col sm:items-end lg:items-end justify-center">
          <p className="font-inter font-semibold text-[0.65rem] text-axim-gold uppercase tracking-wider">Total Recoverable</p>
          <p className="text-2xl sm:text-3xl font-black font-mono text-axim-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">{formattedTotal}</p>
        </div>

      </div>
    </motion.div>
  );
};

export default SummaryCard;
