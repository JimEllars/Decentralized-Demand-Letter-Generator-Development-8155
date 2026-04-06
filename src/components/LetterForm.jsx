import React, { useCallback, memo, useMemo } from 'react';
import { FiUser, FiDollarSign, FiZap, FiPlus } from 'react-icons/fi';
import FormSection from './FormSection';
import LetterItem from './LetterItem';
import SafeIcon from '../common/SafeIcon';
import { STATE_LEGAL_DETAILS, STATE_OPTIONS } from '../utils/constants';
import { generateId, getLocalDateString } from '../utils/helpers';

const PRECOMPUTED_STATE_OPTIONS = STATE_OPTIONS.map(s => (
  <option key={s.code} value={s.code} className="bg-black text-white">
    {s.name}
  </option>
));

const LetterForm = memo(({ formData, onUpdate, errors = {} }) => {
  const itemErrorsMap = useMemo(() => {
    const map = new Map();
    if (errors?.itemErrors) {
      for (const e of errors.itemErrors) {
        map.set(e.index, e.errors);
      }
    }
    return map;
  }, [errors?.itemErrors]);

  const handleChange = (e) => onUpdate(e.target.name, e.target.value);

  const handleAddItem = useCallback(() => {
    // Generate unique ID for new item to ensure stable rendering
    const newItems = [...(formData.items || []), { id: generateId(), description: '', amount: '' }];
    onUpdate('items', newItems);
  }, [formData.items, onUpdate]);

  const handleAddLateFee = useCallback(() => {
    // Calculate 5% of current principal
    const principal = (formData.items || []).reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const fee = (principal * 0.05).toFixed(2);

    const newItems = [...(formData.items || []), { id: generateId(), description: 'Late Payment Fee (5%)', amount: fee }];
    onUpdate('items', newItems);
  }, [formData.items, onUpdate]);

  const handleRemoveItem = useCallback((index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    onUpdate('items', newItems);
  }, [formData.items, onUpdate]);

  const handleItemChange = useCallback((index, field, value) => {
    const newItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onUpdate('items', newItems);
  }, [formData.items, onUpdate]);

  const handleSetToday = useCallback((field) => {
    onUpdate(field, getLocalDateString());
  }, [onUpdate]);

  const handleSetPastDate = useCallback((field, days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    onUpdate(field, getLocalDateString(date));
  }, [onUpdate]);

  const getInputClass = (field, value, required = false) => {
    // Only show error class if errors object explicitly contains an error for this field
    // The errors object passed down will only be populated if hasAttemptedSubmit is true
    const hasError = errors && errors[field];
    const base = "bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors placeholder:text-zinc-600";
    if (hasError) return `${base} border-red-500/50 bg-red-900/10 focus:border-red-500`;
    return base;
  };

  const ErrorMessage = ({ error, id }) => {
    if (!error) return null;
    return <p id={id} className="text-[10px] text-red-400 mt-1 font-mono tracking-wide">{error}</p>;
  };

  return (
    <div className="p-6 space-y-8">
      <FormSection
        title="Legal Strategy"
        icon={FiZap}
        description="Select the governing law and tone for your document. This applies appropriate statutory interest defaults."
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="jurisdiction" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              Jurisdiction
              <span className="text-[10px] text-zinc-500 font-normal normal-case">(Governing Law)</span>
            </label>
            <select
              id="jurisdiction"
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              className="bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors"
            >
              {PRECOMPUTED_STATE_OPTIONS}
              <option value="DEFAULT" className="bg-black text-white">Other / International (6%)</option>
            </select>
            {formData.jurisdiction && STATE_LEGAL_DETAILS[formData.jurisdiction] && (
               <p className="font-inter text-xs text-zinc-400 mt-1 flex items-center gap-1 bg-black/40 p-1.5 rounded-sm border border-subtle">
                  <SafeIcon name="FiInfo" className="text-axim-teal w-3 h-3" />
                  Legal Basis: {STATE_LEGAL_DETAILS[formData.jurisdiction].statute}
               </p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="tone" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Document Tone</label>
            <select
              id="tone"
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors"
            >
              <option value="soft" className="bg-black text-white">Friendly Reminder</option>
              <option value="professional" className="bg-black text-white">Professional</option>
              <option value="firm" className="bg-black text-white">Firm / Standard</option>
              <option value="aggressive" className="bg-black text-white">Aggressive / Intent to Sue</option>
            </select>
          </div>
        </div>

        <div className="space-y-1 mt-4">
            <label htmlFor="statutoryInterest" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">
              Custom Interest Rate Override <span className="text-zinc-500 font-normal normal-case">(Optional - leave 0 to use state default)</span>
            </label>
            <div className="relative">
                <input
                  id="statutoryInterest"
                  type="number"
                  name="statutoryInterest"
                  placeholder={`Current Default: ${STATE_LEGAL_DETAILS[formData.jurisdiction]?.rate || 6}%`}
                  value={formData.statutoryInterest}
                  onChange={handleChange}
                  className="bg-black/50 border border-subtle text-white font-mono text-sm p-3 w-full rounded-sm focus:border-axim-gold focus:outline-none transition-colors placeholder:text-zinc-600 pr-8"
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-zinc-500 pointer-events-none font-mono">
                    %
                 </div>
            </div>
        </div>

         <div className="space-y-1 mt-4">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="letterDate" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Letter Date
                </label>
                <button
                  onClick={() => handleSetToday('letterDate')}
                  className="font-inter text-[0.65rem] font-bold text-axim-teal hover:text-white uppercase transition-colors tracking-wide"
                  type="button"
                >
                  Set to Today
                </button>
            </div>
            <input
              id="letterDate"
              type="date"
              name="letterDate"
              value={formData.letterDate || ''}
              onChange={handleChange}
              className={getInputClass('letterDate', formData.letterDate, true)}
              aria-invalid={!!errors.letterDate}
              aria-describedby={errors.letterDate ? "letterDate-error" : undefined}
            />
            <ErrorMessage id="letterDate-error" error={errors.letterDate} />
        </div>
      </FormSection>

      <FormSection
        title="Parties"
        icon={FiUser}
        description="Enter the exact legal names and valid mailing addresses for both parties. This ensures proper legal service."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="creditorName" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Creditor Name</label>
            <input
              id="creditorName"
              name="creditorName"
              placeholder="Your Name / Company"
              value={formData.creditorName}
              onChange={handleChange}
              className={getInputClass('creditorName', formData.creditorName, true)}
              aria-invalid={!!errors.creditorName}
              aria-describedby={errors.creditorName ? "creditorName-error" : undefined}
            />
            <ErrorMessage id="creditorName-error" error={errors.creditorName} />
          </div>
          <div>
            <label htmlFor="creditorAddress" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Creditor Address</label>
            <textarea
              id="creditorAddress"
              name="creditorAddress"
              placeholder="Your Mailing Address"
              rows="2"
              value={formData.creditorAddress}
              onChange={handleChange}
              className={`${getInputClass('creditorAddress', formData.creditorAddress, true)} resize-none`}
              aria-invalid={!!errors.creditorAddress}
              aria-describedby={errors.creditorAddress ? "creditorAddress-error" : undefined}
            />
            <ErrorMessage id="creditorAddress-error" error={errors.creditorAddress} />
          </div>
          <div>
            <label htmlFor="debtorName" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Debtor Name</label>
            <input
              id="debtorName"
              name="debtorName"
              placeholder="Debtor Full Name"
              value={formData.debtorName}
              onChange={handleChange}
              className={getInputClass('debtorName', formData.debtorName, true)}
              aria-invalid={!!errors.debtorName}
              aria-describedby={errors.debtorName ? "debtorName-error" : undefined}
            />
            <ErrorMessage id="debtorName-error" error={errors.debtorName} />
          </div>
          <div>
            <label htmlFor="debtorAddress" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Debtor Address</label>
            <textarea
              id="debtorAddress"
              name="debtorAddress"
              placeholder="Debtor Mailing Address"
              rows="2"
              value={formData.debtorAddress}
              onChange={handleChange}
              className={`${getInputClass('debtorAddress', formData.debtorAddress, true)} resize-none`}
              aria-invalid={!!errors.debtorAddress}
              aria-describedby={errors.debtorAddress ? "debtorAddress-error" : undefined}
            />
            <ErrorMessage id="debtorAddress-error" error={errors.debtorAddress} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Itemized Debt Specifics"
        icon={FiDollarSign}
        description="List the unpaid invoices, services, or damages. You can easily apply a 5% late fee if applicable to your contract."
      >
        <div id="items-section" className="space-y-3">
          {(formData.items || []).map((item, index) => (
            <LetterItem
              key={item.id}
              item={item}
              index={index}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
              showRemove={formData.items.length > 1}
              itemErrors={itemErrorsMap.get(index)}
            />
          ))}
          {errors.items && <p className="font-mono text-[0.65rem] text-red-400 tracking-wide text-center">{errors.items}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddItem}
              className="flex-1 py-3 border border-subtle border-dashed rounded-sm font-inter text-xs font-semibold tracking-wider text-zinc-400 hover:border-axim-teal hover:text-axim-teal transition-all flex items-center justify-center gap-2 uppercase"
            >
              <SafeIcon icon={FiPlus} /> ADD LINE ITEM
            </button>
            <button
              type="button"
              onClick={handleAddLateFee}
              className="flex-shrink-0 px-4 py-3 border border-subtle border-dashed rounded-sm font-inter text-xs font-semibold tracking-wider text-zinc-400 hover:border-axim-gold hover:text-axim-gold transition-all flex items-center justify-center gap-2 uppercase"
              title="Add 5% Late Fee"
            >
              <SafeIcon icon={FiPlus} /> +5% FEE
            </button>
          </div>
        </div>
        <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="dueDate" className="font-inter text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Original Due Date <span className="text-zinc-500 font-normal normal-case">(Used for interest calc)</span>
            </label>
            <button
                onClick={() => handleSetPastDate('dueDate', 30)}
                className="font-inter text-[0.65rem] font-bold text-axim-teal hover:text-white uppercase transition-colors tracking-wide"
                type="button"
            >
                Set to 30 Days Ago
            </button>
          </div>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            className={getInputClass('dueDate', formData.dueDate, true)}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
          />
          <ErrorMessage id="dueDate-error" error={errors.dueDate} />
        </div>
      </FormSection>
    </div>
  );
});

LetterForm.displayName = 'LetterForm';

export default LetterForm;
