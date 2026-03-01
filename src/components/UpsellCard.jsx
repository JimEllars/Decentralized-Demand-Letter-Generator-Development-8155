import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const UpsellCard = ({ total = 0 }) => {
  const isHighValue = total > 10000;

  if (isHighValue) {
    return (
      <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
        <div className="text-center sm:text-left">
          <h4 className="font-bold text-xl leading-tight">High Value Debt Detected</h4>
          <p className="text-blue-200 text-sm mt-1">
            Debts over $10,000 often require dedicated legal strategy. Let our specialists handle recovery for you.
          </p>
        </div>
        <button className="bg-white text-blue-900 px-6 py-3 rounded-lg text-sm font-black whitespace-nowrap hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2">
          SPEAK TO A SPECIALIST <SafeIcon icon={FiArrowRight} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
      <div className="text-center sm:text-left">
        <h4 className="font-bold text-xl leading-tight">Need Other Documents?</h4>
        <p className="text-slate-300 text-sm opacity-90 mt-1">Check our template library for professional and affordable business documents.</p>
      </div>
      <button className="bg-white text-slate-900 px-6 py-3 rounded-lg text-sm font-black whitespace-nowrap hover:bg-slate-100 transition-all shadow-lg flex items-center gap-2">
        TEMPLATE LIBRARY <SafeIcon icon={FiArrowRight} />
      </button>
    </motion.div>
  );
};

export default UpsellCard;
