'use client';

import { motion } from 'framer-motion';

export default function RefundPolicy() {
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
              Refund Policy
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="w-12 h-[2px] bg-gradient-to-r from-white/50 to-transparent"></div>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">1. Return Eligibility</h2>
              <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, we offer returns within <span className="text-white font-semibold">30 days</span> of purchase. To be eligible for a return, items must be:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unused and in original condition</li>
                <li>With all original tags attached</li>
                <li>In original packaging</li>
                <li>Not damaged due to customer misuse</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">2. Non-Returnable Items</h2>
              <p>The following items cannot be returned:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Clearance or final sale items</li>
                <li>Custom or personalized items</li>
                <li>Swimwear or underwear without original packaging</li>
                <li>Items purchased more than 30 days ago</li>
                <li>Items with evidence of wear or damage</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">3. How to Initiate a Return</h2>
              <p>To start a return:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our customer service team at returns@mystiqueapparel.com</li>
                <li>Provide your order number and reason for return</li>
                <li>Receive a return authorization (RA) number</li>
                <li>Ship the item(s) with the RA number clearly marked</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">4. Shipping Returns</h2>
              <p>Customers are responsible for return shipping costs unless the item is defective or we made an error. We recommend using a trackable shipping method. Once received and inspected, we will process your refund.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">5. Refund Processing</h2>
              <p>Refunds will be issued to the original payment method once we receive and inspect your returned item. Please allow 5-10 business days for the refund to appear in your account, depending on your financial institution.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">6. Exchanges</h2>
              <p>If you received the wrong size or color, we offer free exchanges within 30 days of purchase. Contact us with your order number and the item you'd like to exchange for. We'll provide a return label and arrange shipment of the replacement item.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">7. Defective Items</h2>
              <p>If you receive a defective item, we will offer a full refund or replacement at no cost. Please contact us within 7 days of receiving the item with photos of the defect. We reserve the right to investigate claims of defects.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">8. Damaged in Shipping</h2>
              <p>If your order arrives damaged, please contact us immediately with photos of the damage and packaging. We will work with you to arrange a replacement or refund, and may need to file a claim with the shipping carrier.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">9. Sale Items</h2>
              <p>Items purchased at a discount or on sale are final sale and cannot be returned or exchanged unless defective. Clearance items are non-returnable.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">10. Store Credit Option</h2>
              <p>If you prefer, we offer store credit equal to 110% of your refund amount. This credit can be applied to future purchases at Mystique Apparel.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">11. International Returns</h2>
              <p>International customers are responsible for return shipping costs. Duties and taxes are non-refundable. Returns may take longer to process due to customs procedures.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">12. Return Address</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-3 space-y-2">
                <p className="font-semibold">Mystique Apparel Returns Center</p>
                <p className="text-gray-400">Please check your return authorization email for the specific return address based on your location.</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">13. Questions?</h2>
              <p>If you have questions about our refund policy, please contact us:</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-3">
                <p className="font-semibold">Mystique Apparel Customer Service</p>
                <p className="text-gray-400">Email: returns@mystiqueapparel.com</p>
                <p className="text-gray-400">Response time: Within 24-48 hours</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
