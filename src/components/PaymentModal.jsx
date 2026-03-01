import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCreditCard, FiLock } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const PaymentModal = ({ isProcessing, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
      <div className="bg-blue-900 p-8 text-white text-center">
        <div className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-700">
          <SafeIcon icon={FiLock} className="w-8 h-8" />
        </div>
        <h3 id="modal-title" className="text-xl font-bold">Secure Checkout</h3>
        <p className="text-blue-200 text-xs mt-1">AXiM Encryption Active</p>
      </div>
      <div className="p-8 space-y-6">
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-slate-600 font-medium">Document Access</span>
          <span className="font-bold text-3xl text-blue-900">$9.00</span>
        </div>
        <div className="space-y-3">
          <button onClick={onConfirm} disabled={isProcessing} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            {isProcessing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
            ) : (
              <><SafeIcon icon={FiCreditCard} /> Pay $9.00 Now</>
            )}
          </button>
          <button onClick={onCancel} disabled={isProcessing} className="w-full py-2 text-slate-400 font-medium hover:text-slate-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

export default PaymentModal;