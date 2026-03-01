import React from 'react';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Instructions = () => {
  return (
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
  );
};

export default Instructions;
