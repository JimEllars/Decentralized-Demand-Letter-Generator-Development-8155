import { memo } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const LetterItem = memo(({ item, index, onChange, onRemove, showRemove, itemErrors = {} }) => {
  const getInputClass = (hasError) => {
    const base = "bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors placeholder:text-zinc-600";
    if (hasError) return `${base} border-red-500/50 bg-red-900/10 focus:border-red-500`;
    return base;
  };

  const errorValues = Object.values(itemErrors);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 items-start">
        <div className="flex-grow">
          <input
            aria-label={`Description for item ${index + 1}`}
            placeholder="Description (e.g. Invoice #101)"
            maxLength="2000"
            value={item.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            className={getInputClass(!!itemErrors.description)}
            aria-invalid={!!itemErrors.description}
          />
        </div>
        <div className="flex flex-col w-32 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">
            $
          </div>
          <input
            aria-label={`Amount for item ${index + 1}`}
            type="number"
            placeholder="0.00"
            value={item.amount}
            min="0"
            step="0.01"
            onChange={(e) => {
              // Strip negative signs and prevent negative values
              const val = e.target.value.replace(/-/g, '');
              onChange(index, 'amount', val);
            }}
            className={`${getInputClass(!!itemErrors.amount)} pl-8`}
            aria-invalid={!!itemErrors.amount}
          />
        </div>
        {showRemove && (
          <button onClick={() => onRemove(index)} className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-900/20 rounded-sm transition-colors mt-1" aria-label="Remove item">
            <SafeIcon icon={FiTrash2} />
          </button>
        )}
      </div>
      {errorValues.length > 0 && (
        <div className="font-mono text-[0.65rem] text-red-400 text-right pr-12 space-y-0.5 tracking-wide mt-1">
          {errorValues.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
});

LetterItem.displayName = 'LetterItem';

export default LetterItem;
