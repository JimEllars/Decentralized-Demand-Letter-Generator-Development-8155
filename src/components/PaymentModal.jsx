import React from 'react';
import { motion } from 'framer-motion';
// Note: FiShield, FiCreditCard, and FiLock are actively used below despite potential linter warnings
import { FiShield, FiCreditCard, FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const PaymentModal = ({ isProcessing, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 bg-grid" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-bg-void border border-subtle rounded-sm max-w-sm w-full overflow-hidden shadow-2xl relative">
      <div className="bg-black/40 border-b border-subtle p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <SafeIcon icon={FiShield} className="w-32 h-32" />
        </div>
        <div className="w-16 h-16 bg-black border border-subtle text-axim-teal rounded-sm flex items-center justify-center mx-auto mb-4 relative z-10">
          <SafeIcon icon={FiLock} className="w-8 h-8" />
        </div>
        <h3 id="modal-title" className="font-mono text-axim-gold text-lg uppercase tracking-widest relative z-10">Secure Checkout</h3>
        <p className="font-mono text-[0.65rem] text-zinc-500 mt-2 uppercase tracking-widest relative z-10">AXiM Encryption Active</p>
      </div>
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center bg-black/50 p-4 border border-subtle rounded-sm">
          <span className="font-mono text-[0.65rem] text-zinc-400 uppercase tracking-widest">Document Access</span>
          <span className="font-mono font-bold text-2xl text-white">$4.00</span>
        </div>
        <div className="space-y-4">
          <div className="text-center font-mono text-[0.65rem] text-zinc-500 font-bold mb-2 uppercase tracking-widest">
            All sales are final. No refunds.
          </div>
          <button onClick={onConfirm} disabled={isProcessing} className="w-full bg-axim-gold text-black border border-axim-gold px-8 py-4 font-bold uppercase tracking-[1.5px] text-[0.85rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(255,234,0,0.5)] hover:bg-white hover:border-white disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
            {isProcessing ? (
              <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying...</>
            ) : (
              <><SafeIcon icon={FiCreditCard} /> Pay $4.00 Now</>
            )}
          </button>
          <button onClick={onCancel} disabled={isProcessing} className="w-full py-3 font-mono text-xs text-zinc-500 hover:text-white hover:bg-glass border border-transparent hover:border-subtle transition-all uppercase tracking-widest rounded-sm">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default PaymentModal;