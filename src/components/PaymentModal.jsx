import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiCreditCard, FiLock, FiMail } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const PaymentModal = ({ isProcessing, onConfirm, onCancel }) => {
  const [email, setEmail] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const handleConfirm = async () => {
    onConfirm(email.trim(), marketingOptIn);
  };

  return (
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

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <SafeIcon icon={FiMail} className="text-axim-teal" /> Email Address (Required)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email for document delivery"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-axim-teal transition-colors"
              disabled={isProcessing}
              required
            />
            <label className="flex items-center gap-3 cursor-pointer group mt-2">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="appearance-none w-5 h-5 border border-zinc-600 rounded bg-black/50 checked:bg-axim-teal checked:border-axim-teal transition-colors cursor-pointer"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  disabled={isProcessing}
                />
                {marketingOptIn && (
                  <svg className="absolute w-3 h-3 text-black pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Send me legal updates & templates from AXiM (Optional)
              </span>
            </label>
          </div>

          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="text-center font-mono text-[0.65rem] text-zinc-500 font-bold mb-1 uppercase tracking-widest">
              Quality and Satisfaction Guaranteed.
            </div>
            <div className="text-center font-mono text-[0.65rem] text-amber-500 font-bold mb-4 uppercase tracking-widest">
              ⚠️ DO NOT CLOSE THIS TAB DURING PAYMENT.
            </div>
            <button
              onClick={handleConfirm}
              disabled={isProcessing || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())}
              className={`w-full text-black border px-8 py-4 font-bold uppercase tracking-[1.5px] text-[0.85rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(255,234,0,0.5)] hover:bg-white hover:border-white disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none bg-axim-gold border-axim-gold`}
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing...</>
              ) : (
                <><SafeIcon icon={FiCreditCard} /> Pay with Card</>
              )}
            </button>
            <button onClick={onCancel} disabled={isProcessing} className="w-full py-3 font-mono text-xs text-zinc-500 hover:text-white hover:bg-glass border border-transparent hover:border-subtle transition-all uppercase tracking-widest rounded-sm">
              Cancel
            </button>
            <div className="text-center font-mono text-[0.55rem] text-zinc-600 mt-2 leading-relaxed px-4">
              By proceeding, you acknowledge that QuickDemandLetter is a self-help software tool, not a law firm. This service does not provide legal advice.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
