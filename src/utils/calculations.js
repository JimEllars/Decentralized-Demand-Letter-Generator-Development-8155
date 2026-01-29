/**
 * AXiM Statutory Interest & Calculation Engine
 */

const STATE_INTEREST_RATES = {
  'CA': 10.0,
  'NY': 9.0,
  'FL': 4.75,
  'TX': 6.0,
  'IL': 5.0,
  'GA': 7.0,
  'DEFAULT': 6.0
};

export const calculateTotal = (items = [], interestRate, dueDate, jurisdiction = 'DEFAULT') => {
  // Calculate Principal from itemized list
  const principal = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  
  // Determine Rate
  const r = (parseFloat(interestRate) > 0) 
    ? parseFloat(interestRate) / 100 
    : (STATE_INTEREST_RATES[jurisdiction] || STATE_INTEREST_RATES['DEFAULT']) / 100;

  let interest = 0;
  if (r > 0 && dueDate && principal > 0) {
    const due = new Date(dueDate);
    const now = new Date();
    if (now > due) {
      const diffTime = Math.abs(now - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      interest = (principal * r / 365) * diffDays;
    }
  }

  return {
    principal: principal,
    interest: interest.toFixed(2),
    total: (principal + parseFloat(interest)).toFixed(2),
    rateUsed: (r * 100).toFixed(1)
  };
};

export const getToneTemplate = (tone) => {
  const templates = {
    soft: {
      title: "Courtesy Reminder: Payment Request",
      intro: "We value our professional relationship and are writing to remind you of an outstanding balance.",
      closing: "We appreciate your prompt attention to this matter and look forward to resolving this amicably."
    },
    firm: {
      title: "Formal Demand for Payment - Final Notice",
      intro: "Demand is hereby made for the immediate payment of the balance due. This is our final attempt to resolve this before escalating.",
      closing: "Failure to remit payment by the deadline will result in further administrative action."
    },
    aggressive: {
      title: "Notice of Intent to Pursue Legal Action",
      intro: "This serves as a formal legal demand. Your account is severely delinquent and we are prepared to take any and all legal steps to recover this debt.",
      closing: "Consider this your final warning. We will pursue all legal remedies, including statutory interest and collection costs, without further notice."
    }
  };
  return templates[tone] || templates.firm;
};