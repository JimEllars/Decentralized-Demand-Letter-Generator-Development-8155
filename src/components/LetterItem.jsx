import React from 'react';
import { FiTrash2 } from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const LetterItem = React.memo(({ item, index, onChange, onRemove, showRemove, itemErrors = {} }) => {
  const getInputClass = (hasError) => {
    const base = "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors";
    if (hasError) return `${base} border-red-300 bg-red-50 focus:border-red-500`;
    return `${base} border-slate-300 focus:border-blue-500`;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 items-start">
        <div className="flex-grow">
          <input
            aria-label={`Description for item ${index + 1}`}
            placeholder="Description (e.g. Invoice #101)"
            value={item.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            className={getInputClass(!!itemErrors.description)}
            aria-invalid={!!itemErrors.description}
          />
        </div>
        <div className="flex flex-col w-24">
          <input
            aria-label={`Amount for item ${index + 1}`}
            type="number"
            placeholder="0.00"
            value={item.amount}
            onChange={(e) => onChange(index, 'amount', e.target.value)}
            className={getInputClass(!!itemErrors.amount)}
            aria-invalid={!!itemErrors.amount}
          />
        </div>
        {showRemove && (
          <button onClick={() => onRemove(index)} className="p-2 text-slate-400 hover:text-red-500" aria-label="Remove item">
            <SafeIcon icon={FiTrash2} />
          </button>
        )}
      </div>
      {Object.values(itemErrors).length > 0 && (
        <div className="text-[10px] text-red-500 font-bold text-right pr-12 space-y-0.5">
          {Object.values(itemErrors).map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
});

LetterItem.displayName = 'LetterItem';

export default LetterItem;
