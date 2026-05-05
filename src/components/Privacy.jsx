import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-bg-void text-zinc-300 font-inter py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Last Updated: January 2026
          </p>
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Do Not Collect</h2>
            <p>
              Thanks to our "Zero-Knowledge" architecture, we do not collect, store, or process the Personally Identifiable Information (PII) you enter into our document generator. This includes names, addresses, and debt details. All document generation happens locally in your web browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <p>
              We only collect information necessary to process your payment and deliver our services. This includes your email address (if provided for document delivery) and payment transaction data securely handled by our payment processor, Stripe. We do not have access to your full credit card details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Analytics and Tracking</h2>
            <p>
              We use lightweight, privacy-focused analytics to understand how users interact with our website. This helps us improve our service and measure marketing effectiveness. These tools track general usage patterns and do not capture the sensitive data you input into the document generator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect the limited data we do process. Communications with our servers are encrypted, and we employ a Zero-Trust Token Exchange to secure access to our APIs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
