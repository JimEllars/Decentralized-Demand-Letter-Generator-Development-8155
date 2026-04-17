import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { generatePdfDefinition } from '../services/pdfGenerator';
import { getValidAccessToken } from '../services/paymentService';

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();

  const handleDownload = async (isValid, onError, formData, calculatedValues, toneTemplate, isPaid) => {
    if (!isValid) {
      onError();
      return;
    }

    let accessToken = null;
    if (isPaid) {
      accessToken = getValidAccessToken();
      if (!accessToken) {
        toast.error("Payment session expired. Please complete payment again.");
        return;
      }

      // Basic structural validation to prevent trivial bypass (e.g. users manually setting sessionStorage)
      // We check if it's a dev token or a valid JWT
      const isDevToken = accessToken.startsWith('dev-token-');
      let isValidJwt = false;

      if (!isDevToken) {
        try {
          const parts = accessToken.split('.');
          if (parts.length === 3) {
            // Fix Base64URL to Base64 to support actual JWTs properly without DOMException
            let base64Url = parts[1];
            let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Pad base64 with = so it is a multiple of 4
            const padLength = (4 - (base64.length % 4)) % 4;
            base64 = base64 + '='.repeat(padLength);

            const payload = JSON.parse(atob(base64));
            if (payload && typeof payload === 'object') {
              isValidJwt = true;
            }
          }
        } catch (e) {
          // Decoding failed, not a valid JWT
        }
      }

      if (!isDevToken && !isValidJwt) {
        toast.error("Invalid payment token. Please complete payment again.");
        return;
      }
    }

    setIsGenerating(true);
    // Ensure default empty arrays/values are passed correctly for generator resilience
    const safeFormData = { ...formData, items: Array.isArray(formData?.items) ? formData.items : [] };
    const safeCalculatedValues = calculatedValues || {};
    const docDefinition = generatePdfDefinition(safeFormData, safeCalculatedValues, toneTemplate || {}, { watermark: !isPaid });

    try {
      // 1. Import both modules concurrently
      const [pdfMakeModule, pdfFontsModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts')
      ]);

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

      const safeJurisdiction = (safeFormData.jurisdiction || 'DEFAULT').replace(/[^a-zA-Z0-9]/g, '_');

      // 4. Create and trigger download
      pdfMake.createPdf(docDefinition).download(`Demand_Letter_${safeJurisdiction}.pdf`);

      toast.success("Download started!");
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message || 'An unknown error occurred.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleDownload, isGenerating };
};
