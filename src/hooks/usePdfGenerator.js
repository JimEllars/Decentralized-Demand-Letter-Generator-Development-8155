import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { generatePdfDefinition } from '../services/pdfGenerator';

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleDownload = async (isValid, onError, formData, calculatedValues, toneTemplate, isPaid) => {
    if (!isValid) {
      onError();
      return;
    }

    setIsGenerating(true);
    const docDefinition = generatePdfDefinition(formData, calculatedValues, toneTemplate, { watermark: !isPaid });

    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      // Handle both ESM and CJS exports
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      if (pdfMake.vfs === undefined && pdfFonts && pdfFonts.pdfMake) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      const safeJurisdiction = (formData.jurisdiction || 'DEFAULT').replace(/[^a-zA-Z0-9]/g, '_');
      pdfMake.createPdf(docDefinition).download(`Demand_Letter_${safeJurisdiction}.pdf`);
      toast.success("Download started!");
    } catch (error) {
      console.error('Failed to load PDF generator:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleDownload, isGenerating };
};
