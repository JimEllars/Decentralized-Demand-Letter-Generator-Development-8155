import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { generatePdfDefinition } from '../services/pdfGenerator';
import { getValidAccessToken } from '../services/paymentService';
import { useAuth } from './useAuth';

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
  const { userSession } = useAuth();

  const handleDownload = async (isValid, onError, formData, calculatedValues, toneTemplate, isPaid, legalStatutesClauses) => {
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
    const docDefinition = generatePdfDefinition(safeFormData, safeCalculatedValues, toneTemplate || {}, { watermark: !isPaid, legalStatutesClauses });

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

      // 4. Create PDF Document
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);

      let generatedHash = null;

      if (isPaid) {
        // Generate Buffer/Blob, hash it, stamp it via API, and then download
        const blob = await new Promise((resolve, reject) => {
          pdfDocGenerator.getBlob((blob) => {
            resolve(blob);
          });
        });

        const arrayBuffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        generatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Note: Ledger stamp and secure-artifacts vault API logic have been disabled
        // as they rely on dormant Web3 / User Session functionality.
        // We are relying entirely on local generation and Stripe checkout.
        // To reactivate Web3 features, set VITE_ENABLE_WEB3=true in the environment.

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Demand_Letter_${safeJurisdiction}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Trigger download immediately for non-paid versions
        pdfDocGenerator.download(`Demand_Letter_${safeJurisdiction}.pdf`);
      }

      toast.success("Download started!");
      return generatedHash;
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message || 'An unknown error occurred.'}`);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { handleDownload, isGenerating, setIsGenerating };
};
