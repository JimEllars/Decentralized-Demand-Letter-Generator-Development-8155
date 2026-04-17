import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiCreditCard, FiLock, FiMail } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { ConnectButton, useReadContract, useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient, getContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';

const client = createThirdwebClient({ clientId: "dummy-client-id" });

const dummyContract = getContract({
  client,
  chain: defineChain(1),
  address: "0x0000000000000000000000000000000000000000",
});

const PaymentModal = ({ isProcessing, onConfirm, onCancel, onBypass }) => {
  const [sendEmail, setSendEmail] = useState(false);
  const [email, setEmail] = useState('');

  const account = useActiveAccount();
  const { data: hasToken, isLoading: isTokenLoading } = useReadContract({
    contract: dummyContract,
    method: "function balanceOf(address owner) view returns (uint256)",
    params: account ? [account.address] : [""],
    queryOptions: {
      enabled: !!account,
    }
  });

  const handleConfirm = () => {
    onConfirm(sendEmail ? email : null);
  };

  // For dummy purposes, we assume any connected account has the token
  // Replace this logic with actual `hasToken > 0n` in production
  const canBypass = !!account;

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
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="appearance-none w-5 h-5 border border-zinc-600 rounded bg-black/50 checked:bg-axim-teal checked:border-axim-teal transition-colors cursor-pointer"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  disabled={isProcessing}
                />
                {sendEmail && (
                  <svg className="absolute w-3 h-3 text-black pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors flex items-center gap-2">
                <SafeIcon icon={FiMail} className="text-axim-teal" /> Email me the PDF
              </span>
            </label>

            <AnimatePresence>
              {sendEmail && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-axim-teal transition-colors mt-2"
                    disabled={isProcessing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="text-center font-mono text-[0.65rem] text-zinc-500 font-bold mb-2 uppercase tracking-widest">
              Quality and Satisfaction Guaranteed.
            </div>
            <button
              onClick={handleConfirm}
              disabled={isProcessing || (sendEmail && !email)}
              className="w-full bg-axim-gold text-black border border-axim-gold px-8 py-4 font-bold uppercase tracking-[1.5px] text-[0.85rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(255,234,0,0.5)] hover:bg-white hover:border-white disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isProcessing ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verifying...</>
              ) : (
                <><SafeIcon icon={FiCreditCard} /> Pay $4.00 Now</>
              )}
            </button>

            <div className="py-2 flex items-center justify-center gap-4">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="font-mono text-[0.65rem] text-zinc-500 uppercase tracking-widest">Or</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3">
              <ConnectButton client={client} />

              {canBypass && (
                 <button
                  onClick={onBypass}
                  className="w-full bg-black border border-axim-teal text-axim-teal px-8 py-3 font-bold uppercase tracking-[1px] text-[0.75rem] transition-all duration-300 rounded-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(0,229,255,0.3)] hover:bg-axim-teal/10"
                >
                  <SafeIcon icon={FiShield} /> Bypass Paywall (Node Holder)
                </button>
              )}
            </div>

            <button onClick={onCancel} disabled={isProcessing} className="w-full py-3 font-mono text-xs text-zinc-500 hover:text-white hover:bg-glass border border-transparent hover:border-subtle transition-all uppercase tracking-widest rounded-sm mt-2">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
