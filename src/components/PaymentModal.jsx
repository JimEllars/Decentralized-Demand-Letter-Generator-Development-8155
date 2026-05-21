import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { FiShield, FiCreditCard, FiLock, FiMail } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const PaymentModal = ({ isProcessing, onConfirm, onCancel, formData }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [dataVerified, setDataVerified] = useState(false);

  const handleConfirm = () => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      toast.error("Please enter a valid delivery email address.");
      return;
    }
    if (!dataVerified) {
      toast.error("Please verify your document summary.");
      return;
    }
    onConfirm(email, marketingOptIn);
  };

      return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 bg-grid" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black border border-white/10 rounded-sm max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-hide">
        <div className="bg-black/40 border-b border-white/5 p-6 text-white text-center relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <SafeIcon icon={FiShield} className="w-32 h-32" />
          </div>
          <div className="w-12 h-12 bg-black border border-white/10 text-axim-teal rounded-sm flex items-center justify-center mx-auto mb-3 relative z-10">
            <SafeIcon icon={FiLock} className="w-6 h-6" />
          </div>
          <h3 id="modal-title" className="font-mono text-axim-gold text-base uppercase tracking-widest relative z-10">Secure Checkout</h3>
          <p className="font-mono text-[0.6rem] text-zinc-500 mt-1 uppercase tracking-widest relative z-10">AXiM Encryption Active</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-between items-center bg-black/50 p-4 border border-white/5 rounded-sm">
            <span className="font-mono text-[0.65rem] text-zinc-400 uppercase tracking-widest">Document Access</span>
            <span className="font-mono font-bold text-xl text-white">$4.00</span>
          </div>

          <div className="bg-black/30 border border-white/5 p-4 rounded-sm text-left space-y-2">
            <h4 className="font-mono text-[0.6rem] text-zinc-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Document Summary Verification</h4>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">From:</span>
              <span className="text-white truncate max-w-[180px]">{formData?.creditorName || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">To:</span>
              <span className="text-white truncate max-w-[180px]">{formData?.debtorName || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">State:</span>
              <span className="text-white uppercase">{formData?.jurisdiction || 'N/A'}</span>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group bg-red-500/5 border border-red-500/20 p-3 rounded-sm shrink-0">
            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="appearance-none w-4 h-4 border border-red-500/50 rounded-sm bg-black/50 checked:bg-red-500 checked:border-red-500 transition-colors cursor-pointer"
                checked={dataVerified}
                onChange={(e) => setDataVerified(e.target.checked)}
                disabled={isProcessing}
              />
              {dataVerified && (
                <svg className="absolute w-2.5 h-2.5 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[0.65rem] leading-snug font-medium text-zinc-300">
              I verify all names, addresses, and amounts are spelled correctly. I understand this document is generated instantly and <strong className="text-red-400">all sales are final</strong>.
            </span>
          </label>

          <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }} className="w-full space-y-5">
            <div className="flex flex-col gap-2 shrink-0">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                <SafeIcon icon={FiMail} className="text-axim-teal" /> Delivery Email (Required)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email for document delivery"
                className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-axim-teal transition-colors"
                disabled={isProcessing}
                required
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-white/5 shrink-0">
              <div className="text-center font-mono text-[0.65rem] text-zinc-500 font-bold mb-1 uppercase tracking-widest">
                Quality and Satisfaction Guaranteed.
              </div>
              <button
                type="submit"
                disabled={isProcessing || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email) || !dataVerified}
                className={`w-full text-black border px-6 py-4 font-bold uppercase tracking-[1.5px] text-[0.75rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(255,234,0,0.4)] hover:bg-white hover:border-white disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none bg-axim-gold border-axim-gold`}
              >
                {isProcessing ? (
                  <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><SafeIcon icon={FiCreditCard} /> Pay with Card</>
                )}
              </button>
              <button type="button" onClick={onCancel} disabled={isProcessing} className="w-full py-3 font-mono text-[0.65rem] text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent transition-all uppercase tracking-widest rounded-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
