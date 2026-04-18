import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const UpsellCard = ({ total = 0 }) => {
  const isHighValue = total > 10000;

  if (isHighValue) {
    return (
      <motion.div whileHover={{ y: -2 }} className="bg-black/50 rounded-xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-axim-teal/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-axim-teal/5 z-0"></div>
        <div className="text-center sm:text-left relative z-10">
          <h4 className="font-inter font-bold text-axim-teal text-sm uppercase tracking-wider leading-tight drop-shadow-[0_0_8px_rgba(0,229,255,0.3)]">High-Value Claim Detected</h4>
          <p className="font-inter text-xs text-zinc-300 mt-2 tracking-wide leading-relaxed max-w-md">
            For disputes exceeding $10,000, we highly recommend an attorney review.
          </p>
        </div>
        <button className="relative z-10 bg-axim-teal/10 text-axim-teal border border-axim-teal px-6 py-3 rounded-lg text-xs font-inter font-bold uppercase tracking-wider whitespace-nowrap hover:bg-axim-teal hover:text-black transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] flex items-center gap-2">
          Book a Consultation via AXiM Hub <SafeIcon icon={FiArrowRight} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -2 }} className="bg-black/50 rounded-xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl border border-subtle">
      <div className="text-center sm:text-left">
        <h4 className="font-inter font-bold text-axim-gold text-sm uppercase tracking-wider leading-tight">Need Other Documents?</h4>
        <p className="font-inter text-xs text-zinc-400 mt-2 tracking-wide leading-relaxed max-w-md">Check our template library for professional and affordable business documents.</p>
      </div>
      <button className="bg-black text-axim-gold border border-axim-gold px-6 py-3 rounded-lg text-xs font-inter font-bold uppercase tracking-wider whitespace-nowrap hover:bg-axim-gold hover:text-black transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
        TEMPLATE LIBRARY <SafeIcon icon={FiArrowRight} />
      </button>
    </motion.div>
  );
};

export default UpsellCard;
