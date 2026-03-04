'use client';

import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.2em]">
              Privacy Policy
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="w-12 h-[2px] bg-gradient-to-r from-white/50 to-transparent"></div>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information</li>
                <li>Account credentials</li>
                <li>Communication preferences</li>
                <li>Feedback and product reviews</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">2. Automatic Collection</h2>
              <p>When you use our website, we automatically collect certain information including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>IP address</li>
                <li>Pages visited and time spent on our site</li>
                <li>Device identifiers</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">3. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processing transactions and sending related information</li>
                <li>Providing customer support and responding to inquiries</li>
                <li>Sending promotional emails and marketing materials (with your consent)</li>
                <li>Improving our website and services</li>
                <li>Personalizing your experience</li>
                <li>Detecting and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">4. Information Sharing</h2>
              <p>We do not sell your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who assist us in operating our website and conducting business</li>
                <li>Payment processors to complete your transactions</li>
                <li>Shipping partners to deliver your orders</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">5. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">6. Cookies</h2>
              <p>We use cookies to enhance your experience on our website. You can control cookie settings through your browser preferences.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">8. Third-Party Links</h2>
              <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">9. Children's Privacy</h2>
              <p>Our website is not intended for children under 13 years old. We do not knowingly collect personal information from children. If we become aware of such collection, we will take immediate steps to delete such information.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">10. Policy Updates</h2>
              <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or by posting a prominent notice on our website.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">11. Contact Us</h2>
              <p>If you have questions about this privacy policy or our privacy practices, please contact us at:</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-3">
                <p className="font-semibold">Mystique Apparel</p>
                <p className="text-gray-400">Email: privacy@mystiqueapparel.com</p>
                <p className="text-gray-400">Response time: Within 30 days</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
