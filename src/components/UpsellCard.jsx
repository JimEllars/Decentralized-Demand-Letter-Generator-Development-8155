import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const UpsellCard = ({ total = 0 }) => {
  const isHighValue = total > 10000;

  if (isHighValue) {
    return (
      <motion.div whileHover={{ y: -2 }} className="bg-glass rounded-sm p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border border-axim-teal/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-axim-teal/5 z-0"></div>
        <div className="text-center sm:text-left relative z-10">
          <h4 className="font-mono text-axim-teal text-sm uppercase tracking-widest leading-tight">High Value Debt Detected</h4>
          <p className="font-mono text-[0.65rem] text-zinc-400 mt-2 tracking-wide leading-relaxed">
            Debts over $10,000 often require dedicated legal strategy. Let our specialists handle recovery for you.
          </p>
        </div>
        <button className="relative z-10 bg-black text-axim-teal border border-axim-teal px-6 py-3 rounded-sm text-xs font-mono uppercase tracking-widest whitespace-nowrap hover:bg-axim-teal hover:text-black transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] flex items-center gap-2">
          SPEAK TO A SPECIALIST <SafeIcon icon={FiArrowRight} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-glass rounded-sm p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border border-subtle backdrop-blur-sm">
      <div className="text-center sm:text-left">
        <h4 className="font-mono text-axim-gold text-sm uppercase tracking-widest leading-tight">Need Other Documents?</h4>
        <p className="font-mono text-[0.65rem] text-zinc-400 mt-2 tracking-wide leading-relaxed">Check our template library for professional and affordable business documents.</p>
      </div>
      <button className="bg-black text-axim-gold border border-axim-gold px-6 py-3 rounded-sm text-xs font-mono uppercase tracking-widest whitespace-nowrap hover:bg-axim-gold hover:text-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,234,0,0.1)]">
        TEMPLATE LIBRARY <SafeIcon icon={FiArrowRight} />
      </button>
    </motion.div>
  );
};

export default UpsellCard;
