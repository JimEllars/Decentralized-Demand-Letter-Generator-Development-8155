import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import { STATE_LEGAL_DETAILS, TONE_TEMPLATES } from './constants.js';
import { formatCurrency } from './formatters.js';

/**
 * AXiM Statutory Interest & Calculation Engine
 */

export const calculateTotal = (items = [], interestRate, dueDate, jurisdiction = 'DEFAULT', letterDate = null) => {
  // Ensure items is an array
  const safeItems = Array.isArray(items) ? items : [];

  // Calculate Principal from itemized list
  const principal = safeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  // Resolve jurisdiction safely
  const safeJurisdiction = (STATE_LEGAL_DETAILS && STATE_LEGAL_DETAILS[jurisdiction])
    ? jurisdiction
    : 'DEFAULT';

  const legalDetails = STATE_LEGAL_DETAILS[safeJurisdiction];

  // Check for custom rate override
  const customRate = parseFloat(interestRate);
  const isCustomRate = !isNaN(customRate) && customRate > 0;

  // Determine Rate
  const rPercentage = isCustomRate ? customRate : legalDetails.rate;
  const r = rPercentage / 100;

  // Determine Statute Used
  const statuteUsed = isCustomRate
    ? `Custom Agreed Rate (${customRate}%)`
    : legalDetails.statute;

  let interest = 0;
  let diffDays = 0;

  if (dueDate && principal > 0) {
    const due = parseISO(dueDate);
    // Use letterDate if provided, otherwise default to today
    const end = letterDate ? parseISO(letterDate) : startOfToday();

    // Calculate difference in calendar days
    // If letterDate is before dueDate, diff will be negative or zero, handled by diff > 0 check
    const diff = differenceInCalendarDays(end, due);

    if (diff > 0) {
      diffDays = diff;
      if (r > 0) {
        interest = (principal * r / 365) * diffDays;
      }
    }
  }

  const total = principal + interest;

  return {
    principal: principal,
    interest: interest,
    total: total,
    formattedPrincipal: formatCurrency(principal),
    formattedInterest: formatCurrency(interest),
    formattedTotal: formatCurrency(total),
    rateUsed: rPercentage.toFixed(2),
    daysOverdue: diffDays,
    statuteUsed: statuteUsed
  };
};

export const getToneTemplate = (tone) => {
  return TONE_TEMPLATES[tone] || TONE_TEMPLATES.firm;
};
