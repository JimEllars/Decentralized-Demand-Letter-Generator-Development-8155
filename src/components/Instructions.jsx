import React from 'react';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Instructions = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-glass rounded-sm border border-subtle p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left backdrop-blur-sm"
    >
      <div className="flex-1">
        <h2 className="font-mono text-axim-gold text-[0.7rem] uppercase tracking-widest mb-4">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-4 text-xs font-mono text-zinc-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="bg-black border border-subtle text-axim-teal font-bold w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
            <span>Enter Details</span>
          </div>
          <div className="hidden md:block text-subtle">|</div>
          <div className="flex items-center gap-2">
            <span className="bg-black border border-subtle text-axim-teal font-bold w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
            <span>Secure Payment</span>
          </div>
          <div className="hidden md:block text-subtle">|</div>
          <div className="flex items-center gap-2">
            <span className="bg-black border border-subtle text-axim-teal font-bold w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
            <span>Instant Download</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[0.65rem] font-mono tracking-widest uppercase bg-black/40 text-axim-teal px-4 py-2 rounded-sm border border-subtle">
        <SafeIcon icon={FiLock} /> Zero-Knowledge Privacy
      </div>
    </motion.section>
  );
};

export default Instructions;
