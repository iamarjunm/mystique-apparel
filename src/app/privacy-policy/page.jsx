'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="space-y-10"
        >
          <div className="border-b border-[#0D0D0D]/12 pb-8 space-y-3">
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block">
              Legal Dossier // 01
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              Privacy Policy
            </h1>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.18em] text-[#64625C]">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-11 space-y-9 font-body text-sm sm:text-[15px] text-[#64625C] leading-[1.85]">
            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information</li>
                <li>Account credentials</li>
                <li>Communication preferences</li>
                <li>Feedback and product reviews</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">2. Automatic Collection</h2>
              <p>When you use our website, we automatically collect certain information including:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>IP address</li>
                <li>Pages visited and time spent on our site</li>
                <li>Device identifiers</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">3. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Processing transactions and sending related information</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Sending promotional emails and marketing materials (with your consent)</li>
                <li>Improving our website and services</li>
                <li>Personalizing your experience</li>
                <li>Detecting and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">4. Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Service providers who assist us in operating our website and conducting business</li>
                <li>Payment processors to complete your transactions</li>
                <li>Shipping partners to deliver your orders</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">5. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">6. Cookies</h2>
              <p>We use cookies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">8. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">9. Children&apos;s Privacy</h2>
              <p>Our website is not intended for children under 13 years old. We do not knowingly collect personal information from children. If we become aware of such collection, we will take immediate steps to delete such information.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">10. Policy Updates</h2>
              <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or by posting a prominent notice on our website.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">11. Contact Us</h2>
              <p>If you have questions about this privacy policy or our privacy practices, please contact us at:</p>
              <div className="bg-[#EAE8E2] border border-[#0D0D0D]/12 rounded-[2px] p-5 mt-3 space-y-1">
                <p className="font-semibold text-[#0D0D0D]">Mystique Apparel</p>
                <p className="text-[#64625C]">
                  Email:{' '}
                  <a
                    href="mailto:apparelmystique1@gmail.com"
                    className="text-[#0D0D0D] underline underline-offset-4"
                  >
                    apparelmystique1@gmail.com
                  </a>
                </p>
                <p className="text-[#64625C]">Response time: Within 24–48 hours</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
