'use client';

import { motion } from 'framer-motion';

export default function TermsConditions() {
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
              Legal Dossier // 02
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              Terms &amp; Conditions
            </h1>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.18em] text-[#64625C]">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-11 space-y-9 font-body text-sm sm:text-[15px] text-[#64625C] leading-[1.85]">
            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">1. Acceptance of Terms</h2>
              <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">2. Use License</h2>
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on Mystique Apparel&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or &ldquo;mirroring&rdquo; the materials on any other server</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">3. Disclaimer</h2>
              <p>The materials on Mystique Apparel&apos;s website are provided on an &lsquo;as is&rsquo; basis. Mystique Apparel makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">4. Limitations</h2>
              <p>In no event shall Mystique Apparel or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Mystique Apparel&apos;s website, even if Mystique Apparel or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">5. Accuracy of Materials</h2>
              <p>The materials appearing on Mystique Apparel&apos;s website could include technical, typographical, or photographic errors. Mystique Apparel does not warrant that any of the materials on its website are accurate, complete, or current. Mystique Apparel may make changes to the materials contained on its website at any time without notice.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">6. Links</h2>
              <p>Mystique Apparel has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Mystique Apparel of the site. Use of any such linked website is at the user&apos;s own risk.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">7. Modifications</h2>
              <p>Mystique Apparel may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">8. Product Information</h2>
              <p>We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions, pricing, or other content on the website is accurate, complete, reliable, current, or error-free. If a product offered by Mystique Apparel is not as described, your sole remedy is to return it in unused condition.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">9. Pricing and Availability</h2>
              <p>All prices are subject to change without notice. We reserve the right to limit quantities. Products are subject to availability, and we reserve the right to discontinue any product at any time. Prices and product availability are subject to confirmation at the time of order.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">10. Payment</h2>
              <p>Payment must be received before shipment. We accept various payment methods as indicated on our website. You authorize us to charge the payment method you provide for the full amount of your order including any applicable taxes and shipping costs.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">11. User Accounts</h2>
              <p>If you create an account on our website, you are responsible for maintaining the confidentiality of your password and account information. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">12. Prohibited Conduct</h2>
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Violating any laws or regulations</li>
                <li>Infringing upon intellectual property rights</li>
                <li>Harassing, threatening, or defaming others</li>
                <li>Interfering with the website&apos;s functionality</li>
                <li>Uploading malware or harmful content</li>
              </ul>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">13. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Mystique Apparel operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">14. Contact Information</h2>
              <p>If you have any questions about these Terms &amp; Conditions, please contact us at:</p>
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
