
/**
 * Shared formatters and cache to improve performance
 */
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
});

const dateFormatter = new Intl.DateTimeFormat(undefined);
const dateCache = new Map();

/**
 * Helper to format currency
 */
const formatCurrency = (amount) => {
  return currencyFormatter.format(amount);
};

/**
 * Helper to format date YYYY-MM-DD to Locale Date String
 */
const formatDate = (dateString) => {
  if (!dateString) return dateFormatter.format(new Date());

  const cached = dateCache.get(dateString);
  if (cached) return cached;

  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);

  // Guard against invalid dates to match original toLocaleDateString() behavior
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const formatted = dateFormatter.format(date);
  dateCache.set(dateString, formatted);
  return formatted;
};

/**
 * Generates the PDF definition for pdfMake
 * @param {Object} formData - Form data from the store
 * @param {Object} calculatedValues - Result from calculateTotal
 * @param {Object} tone - Tone template object
 * @returns {Object} PDF definition object
 */
export const generatePdfDefinition = (formData, calculatedValues, tone) => {
  const { formattedTotal, formattedInterest, rateUsed } = calculatedValues;

  return {
    content: [
      { text: tone.title, style: 'header', alignment: 'center' },
      { text: '\n\n' },
      { columns: [
        { stack: [{ text: 'FROM:', style: 'label' }, { text: formData.creditorName, bold: true }] },
        { stack: [{ text: 'DATE:', style: 'label', alignment: 'right' }, { text: formatDate(formData.letterDate), alignment: 'right' }] }
      ]},
      { text: '\n' },
      { stack: [{ text: 'TO:', style: 'label' }, { text: formData.debtorName, bold: true }, { text: formData.debtorAddress }] },
      { text: `\nRE: NOTICE OF OVERDUE ACCOUNT (${formData.jurisdiction})`, style: 'subheader' },
      { text: `\n${tone.intro}` },
      { text: '\n' },
      { table: { widths: ['*', 'auto'], body: [
        [{ text: 'Description', bold: true }, { text: 'Amount', bold: true }],
        ...(formData.items || []).map(i => [
          i.description || 'Item',
          formatCurrency(parseFloat(i.amount || 0))
        ]),
        [{ text: `Statutory Interest (${rateUsed}%)`, italic: true }, formattedInterest],
        [{ text: 'TOTAL DUE', bold: true, fillColor: '#f1f5f9' }, { text: formattedTotal, bold: true, fillColor: '#f1f5f9' }]
      ]}},
      { text: `\nPayment must be received by ${formatDate(formData.dueDate)}. ${tone.closing}` },
      { text: '\n\nSincerely,\n\n__________________________\n' + formData.creditorName },
      { text: '\n\nGenerated via AXiM Documents Automation', style: 'footer', alignment: 'center' }
    ],
    styles: {
      header: { fontSize: 16, bold: true, color: '#1e3a8a' },
      subheader: { fontSize: 12, bold: true },
      label: { fontSize: 8, color: 'grey' },
      footer: { fontSize: 8, color: '#cccccc', margin: [0, 50, 0, 0] }
    }
  };
};
