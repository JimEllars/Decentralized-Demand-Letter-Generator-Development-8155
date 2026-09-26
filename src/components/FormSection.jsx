import SafeIcon from '../common/SafeIcon';
import { motion } from 'framer-motion';

const FormSection = ({ title, icon: Icon, description, children, isGenerating }) => (
  <div className="space-y-4 pt-8 border-t border-subtle first:border-t-0 first:pt-0" aria-live="polite">
    <div>
      <h3 className="font-inter font-semibold text-axim-gold text-sm tracking-wide flex items-center gap-2 uppercase">
        <SafeIcon icon={Icon} className="w-4 h-4" aria-hidden="true" />
        {title}
        {isGenerating && (
           <motion.span
             initial={{ opacity: 0 }}
             animate={{ opacity: [0, 1, 0] }}
             transition={{ repeat: Infinity, duration: 1.5 }}
             className="ml-2 w-2 h-2 bg-axim-teal rounded-full"
             aria-hidden="true"
           />
        )}
      </h3>
      {description && (
        <p className="font-inter text-xs text-zinc-400 mt-1 pl-6 tracking-wide" id={`desc-${title.replace(/\s+/g, '-')}`}>
          {description}
        </p>
      )}
    </div>
    {isGenerating ? (
        <div className="space-y-3 animate-pulse pt-2">
            <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
            <div className="h-10 bg-zinc-900 rounded border border-zinc-800 w-full"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/3 mt-4"></div>
            <div className="h-10 bg-zinc-900 rounded border border-zinc-800 w-full"></div>
        </div>
    ) : (
        <div className="grid grid-cols-1 gap-5" aria-describedby={description ? `desc-${title.replace(/\s+/g, '-')}` : undefined}>
          {children}
        </div>
    )}
  </div>
);

export default FormSection;
