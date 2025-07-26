import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including when you create an account, use our services, or communicate with us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect our company and users.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
          <p>We do not share your personal information with companies, organizations, or individuals outside of our company except in the following cases:</p>
          <ul className="list-disc pl-6 mt-2">
            <li>With your consent</li>
            <li>For legal reasons</li>
            <li>With our service providers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
          <p>We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You can also object to our processing of your personal information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us.</p>
        </section>
      </div>
    </div>
  );
}; 