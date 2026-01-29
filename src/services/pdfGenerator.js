
/**
 * Generates the PDF definition for pdfMake
 * @param {Object} formData - Form data from the store
 * @param {Object} calculatedValues - Result from calculateTotal
 * @param {Object} tone - Tone template object
 * @returns {Object} PDF definition object
 */
export const generatePdfDefinition = (formData, calculatedValues, tone) => {
  const { total, interest, rateUsed } = calculatedValues;

  return {
    content: [
      { text: tone.title, style: 'header', alignment: 'center' },
      { text: '\n\n' },
      { columns: [
        { stack: [{ text: 'FROM:', style: 'label' }, { text: formData.creditorName, bold: true }] },
        { stack: [{ text: 'DATE:', style: 'label', alignment: 'right' }, { text: new Date().toLocaleDateString(), alignment: 'right' }] }
      ]},
      { text: '\n' },
      { stack: [{ text: 'TO:', style: 'label' }, { text: formData.debtorName, bold: true }, { text: formData.debtorAddress }] },
      { text: `\nRE: NOTICE OF OVERDUE ACCOUNT (${formData.jurisdiction})`, style: 'subheader' },
      { text: `\n${tone.intro}` },
      { text: '\n' },
      { table: { widths: ['*', 'auto'], body: [
        [{ text: 'Description', bold: true }, { text: 'Amount', bold: true }],
        ...(formData.items || []).map(i => [i.description || 'Item', `$${parseFloat(i.amount || 0).toFixed(2)}`]),
        [{ text: `Statutory Interest (${rateUsed}%)`, italic: true }, `$${interest}`],
        [{ text: 'TOTAL DUE', bold: true, fillColor: '#f1f5f9' }, { text: `$${total}`, bold: true, fillColor: '#f1f5f9' }]
      ]}},
      { text: `\nPayment must be received by ${formData.dueDate || 'immediately'}. ${tone.closing}` },
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
