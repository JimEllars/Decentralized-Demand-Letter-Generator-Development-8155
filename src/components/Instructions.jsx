import React from 'react';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const Instructions = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/50 rounded-xl border border-subtle p-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left shadow-lg"
    >
      <div className="flex-1 w-full">
        <h2 className="font-inter font-semibold text-axim-gold text-sm tracking-wider mb-4 uppercase">How It Works</h2>
        <div className="flex flex-col md:flex-row gap-6 md:gap-4 text-sm font-inter text-zinc-300">
          <div className="flex items-center gap-3">
            <span className="bg-axim-teal/10 border border-axim-teal/30 text-axim-teal font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)]">1</span>
            <div className="text-left">
              <span className="font-semibold text-white block">Enter Details</span>
              <span className="text-xs text-zinc-400">Fill in the required fields.</span>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center text-subtle px-2">
             <SafeIcon name="FiArrowRight" className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-axim-teal/10 border border-axim-teal/30 text-axim-teal font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)]">2</span>
            <div className="text-left">
              <span className="font-semibold text-white block">Secure Payment</span>
              <span className="text-xs text-zinc-400">Checkout via Stripe.</span>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center text-subtle px-2">
             <SafeIcon name="FiArrowRight" className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-axim-teal/10 border border-axim-teal/30 text-axim-teal font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.2)]">3</span>
            <div className="text-left">
              <span className="font-semibold text-white block">Instant Download</span>
              <span className="text-xs text-zinc-400">Get your compliant PDF.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-inter font-medium tracking-wide bg-black/60 text-axim-teal px-5 py-3 rounded-xl border border-axim-teal/20 shadow-md whitespace-nowrap mt-4 md:mt-0">
        <SafeIcon icon={FiLock} className="w-4 h-4" />
        <div className="flex flex-col text-left leading-tight">
          <span>Zero-Knowledge Privacy</span>
          <span className="text-[10px] text-zinc-400 font-normal">Data stays on your device</span>
        </div>
      </div>
    </motion.section>
  );
};

export default Instructions;
