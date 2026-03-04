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
      // 1. Import both modules dynamically
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      // 2. Resolve the exports (handling both ESM and CJS patterns)
      const pdfMake = pdfMakeModule.default || pdfMakeModule;

      const vfs = (pdfFontsModule.default && pdfFontsModule.default.pdfMake)
        ? pdfFontsModule.default.pdfMake.vfs
        : (pdfFontsModule.pdfMake ? pdfFontsModule.pdfMake.vfs : (pdfFontsModule.default ? pdfFontsModule.default : null));

      if (!vfs) {
        throw new Error("PDF Fonts (VFS) failed to load. The font file may be empty.");
      }

      // 3. Explicitly attach the VFS to this instance of pdfMake
      pdfMake.vfs = vfs;

      const safeJurisdiction = (formData.jurisdiction || 'DEFAULT').replace(/[^a-zA-Z0-9]/g, '_');

      // 4. Create and trigger download
      pdfMake.createPdf(docDefinition).download(`Demand_Letter_${safeJurisdiction}.pdf`);

      toast.success("Download started!");
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error(`Failed to generate PDF: ${error.message || 'Check browser console.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleDownload, isGenerating };
};
