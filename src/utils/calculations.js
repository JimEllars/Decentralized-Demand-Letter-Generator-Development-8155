import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import { STATE_INTEREST_RATES, TONE_TEMPLATES } from './constants.js';

/**
 * AXiM Statutory Interest & Calculation Engine
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

export const calculateTotal = (items = [], interestRate, dueDate, jurisdiction = 'DEFAULT', letterDate = null) => {
  // Calculate Principal from itemized list
  const principal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  // Determine Rate
  const r = (parseFloat(interestRate) > 0) 
    ? parseFloat(interestRate) / 100 
    : (STATE_INTEREST_RATES[jurisdiction] || STATE_INTEREST_RATES['DEFAULT']) / 100;

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
    formattedPrincipal: currencyFormatter.format(principal),
    formattedInterest: currencyFormatter.format(interest),
    formattedTotal: currencyFormatter.format(total),
    rateUsed: (r * 100).toFixed(2),
    daysOverdue: diffDays
  };
};

export const getToneTemplate = (tone) => {
  return TONE_TEMPLATES[tone] || TONE_TEMPLATES.firm;
};
