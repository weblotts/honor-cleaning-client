import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Honor Cleaning privacy policy. Learn how we collect, use, and protect your personal data in compliance with Massachusetts 201 CMR 17.00.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>
              Honor Cleaning collects only the minimum personal information necessary to provide our
              cleaning services:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Name</strong> — to identify you and address you properly</li>
              <li><strong>Email address</strong> — for account access, booking confirmations, and invoices</li>
              <li><strong>Phone number</strong> (optional) — for appointment reminders via SMS</li>
              <li><strong>Service address</strong> — to dispatch our cleaning team</li>
              <li><strong>Payment token</strong> — a tokenized reference via Stripe; we never see or store your card number</li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> collect Social Security numbers, government IDs, financial
              account numbers, or any other sensitive personal information beyond what is listed above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Processing and fulfilling cleaning service bookings</li>
              <li>Sending booking confirmations, reminders, and invoices</li>
              <li>Processing payments securely through Stripe</li>
              <li>Communicating with you about your account and services</li>
              <li>Improving our services and customer experience</li>
              <li>If you opt in: sending promotional offers via email or SMS</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Third-Party Service Providers</h2>
            <p>We share your information only with the following trusted service providers:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stripe</strong> — payment processing (PCI DSS Level 1 compliant)</li>
              <li><strong>SendGrid</strong> — transactional email delivery</li>
              <li><strong>Twilio</strong> — SMS appointment reminders (only if you provide a phone number)</li>
              <li><strong>Amazon Web Services (S3)</strong> — secure storage of job photos (before/after)</li>
            </ul>
            <p className="mt-2">
              We do not sell, rent, or share your personal information with third parties for
              marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Data Security</h2>
            <p>
              In compliance with Massachusetts regulation <strong>201 CMR 17.00</strong>, we implement
              the following security measures:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All data transmitted over HTTPS/TLS encryption</li>
              <li>Personal information (name, phone, address) encrypted at rest using AES-256-CBC</li>
              <li>No raw credit card data is ever stored, logged, or transmitted through our systems</li>
              <li>Multi-factor authentication required for all staff and administrator accounts</li>
              <li>Access tokens expire every 15 minutes; refresh tokens rotate on each use</li>
              <li>Role-based access controls enforced on every API endpoint</li>
              <li>Complete audit logging of all data modifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed
              to provide services. Inactive customer accounts are automatically purged after
              <strong> 3 years</strong> of inactivity, in accordance with our data retention policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access</strong> your personal data through your account dashboard</li>
              <li><strong>Correct</strong> inaccurate personal information</li>
              <li><strong>Delete</strong> your account and all associated data at any time via your account settings</li>
              <li><strong>Opt out</strong> of marketing communications at any time</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, log into your account or contact us at
              privacy@honorcleaning.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Data Breach Notification</h2>
            <p>
              In accordance with <strong>M.G.L. Chapter 93H</strong>, in the event of a data breach
              involving your personal information, we will notify affected Massachusetts residents and
              the Massachusetts Attorney General within 30 days of discovery.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this privacy policy or our data practices, contact us at:
            </p>
            <p className="mt-2">
              Honor Cleaning<br />
              Email: privacy@honorcleaning.com<br />
              Phone: (508) 333-1838<br />
              Boston, MA
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
