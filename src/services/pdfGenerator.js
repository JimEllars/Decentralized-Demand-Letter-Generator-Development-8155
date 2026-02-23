
import { formatCurrency } from '../utils/formatters.js';
import { STATE_SPECIFIC_CLAUSES } from '../utils/constants.js';

/**
 * Shared formatters and cache to improve performance
 */
const dateFormatter = new Intl.DateTimeFormat(undefined);
const dateCache = new Map();

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

  if (dateCache.size >= 1000) {
    const firstKey = dateCache.keys().next().value;
    dateCache.delete(firstKey);
  }

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
export const generatePdfDefinition = (formData, calculatedValues, tone, options = {}) => {
  const { formattedTotal, formattedInterest, rateUsed, statuteUsed } = calculatedValues;

  const legalDisclosure = STATE_SPECIFIC_CLAUSES[formData.jurisdiction] || STATE_SPECIFIC_CLAUSES['DEFAULT'];

  const docDefinition = {
    content: [
      { text: tone.title, style: 'header', alignment: 'center' },
      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#1e3a8a' }] },
      { text: '\n\n' },
      { columns: [
        { stack: [{ text: 'FROM:', style: 'label' }, { text: formData.creditorName, bold: true }, { text: formData.creditorAddress || '' }] },
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
      { text: '\n' },
      // Legal Authority Section
      { text: 'LEGAL AUTHORITY & INTEREST CALCULATION', style: 'subheader' },
      { text: `This demand includes interest calculated at an annual rate of ${rateUsed}% pursuant to ${statuteUsed || 'applicable law'}.`, style: 'small' },

      // State-Specific Legal Disclosures
      ...(legalDisclosure ? [
        { text: '\n' },
        { text: legalDisclosure.label.toUpperCase(), style: 'subheader' },
        { text: legalDisclosure.text, style: 'small', italics: true }
      ] : []),

      { text: '\n\nSincerely,\n\n__________________________\n' + formData.creditorName }
    ],
    styles: {
      header: { fontSize: 16, bold: true, color: '#1e3a8a' },
      subheader: { fontSize: 12, bold: true, margin: [0, 10, 0, 5] },
      label: { fontSize: 8, color: 'grey' },
      small: { fontSize: 9, color: '#475569' },
      footer: { fontSize: 8, color: '#cccccc', margin: [0, 50, 0, 0] }
    }
  };

  if (options.watermark) {
    docDefinition.watermark = { text: 'PREVIEW - NOT FOR USE', color: 'gray', opacity: 0.2, bold: true, italics: false };
  }

  return docDefinition;
};
