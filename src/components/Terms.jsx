import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-bg-void text-zinc-300 font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Last Updated: January 2026
          </p>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Nature of Service</h2>
            <p>
              QuickDemandLetter is a "Self-Help Document Generator." We are not a law firm, and our services do not constitute legal advice. We do not establish an attorney-client relationship. By using our service, you acknowledge that you are representing yourself in any legal matter you undertake.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Data Privacy & Zero-Knowledge Architecture</h2>
            <p>
              We prioritize your privacy. QuickDemandLetter utilizes a "Zero-Knowledge" architecture. We do not store your Personally Identifiable Information (PII) or the contents of your generated documents on our central servers. All document synthesis occurs within your browser session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Payments & Refund Policy</h2>
            <p>
              All sales are final. Once a document is generated and the high-quality, unwatermarked PDF is unlocked, we cannot issue refunds. Please ensure you have reviewed the "PREVIEW" version of your document carefully before proceeding to payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Limitation of Liability</h2>
            <p>
              AXiM Systems and QuickDemandLetter shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, including but not limited to the outcome of any legal dispute in which our documents are used.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
