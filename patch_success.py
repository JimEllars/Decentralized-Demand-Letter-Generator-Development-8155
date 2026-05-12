import sys

def patch():
    with open('src/components/SuccessPage.jsx', 'r') as f:
        content = f.read()

    # 1. Import
    old_import = "import { verifyPaymentSession, deliverOrchestratedDocument } from '../services/paymentService';"
    new_import = "import { verifyPaymentSession, deliverDocumentViaEmail } from '../services/paymentService';"
    content = content.replace(old_import, new_import)

    # 2. Add useState for pdfBase64
    old_generating = "  const [isGenerating, setIsGenerating] = useState(false);"
    new_generating = "  const [isGenerating, setIsGenerating] = useState(false);\n  const [pdfBase64, setPdfBase64] = useState(null);"
    content = content.replace(old_generating, new_generating)

    # 3. Capture Base64
    old_blob = """       const blob = await response.blob();
       const url = window.URL.createObjectURL(blob);"""
    new_blob = """       const blob = await response.blob();
       const reader = new FileReader();
       reader.readAsDataURL(blob);
       reader.onloadend = () => {
         setPdfBase64(reader.result.split(',')[1]);
       };
       const url = window.URL.createObjectURL(blob);"""
    content = content.replace(old_blob, new_blob)

    # 4. handleSendEmail rewrite
    old_handleSendEmail = """  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSendingEmail(true);
    try {
      await deliverOrchestratedDocument('demand_letter_v1', formData, email);
      toast.success(`Document sent to ${email}`);
      setEmail('');
    } catch (err) {
      toast.info('Email services are currently offline. Please use the Download button to save your document.');
      console.error('Email send error:', err);
    } finally {
      setIsSendingEmail(false);
    }
  };"""

    new_handleSendEmail = """  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) { toast.error("Please enter a valid email address."); return; }
    if (!pdfBase64) { toast.error("Document is still encrypting, please wait a moment."); return; }

    setIsSendingEmail(true);
    try {
      await deliverDocumentViaEmail(email, pdfBase64);
      toast.success(`Document securely sent to ${email}`);
      setEmail('');
    } catch (err) {
      toast.error('Email services offline. Please try downloading instead.');
    } finally { setIsSendingEmail(false); }
  };"""

    content = content.replace(old_handleSendEmail, new_handleSendEmail)

    with open('src/components/SuccessPage.jsx', 'w') as f:
        f.write(content)

patch()
