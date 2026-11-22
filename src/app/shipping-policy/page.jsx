'use client';

import { motion } from 'framer-motion';

export default function ShippingPolicy() {
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
              Legal Dossier // 03
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
              Shipping Policy
            </h1>
            <p className="font-mono-tech text-[11px] uppercase tracking-[0.18em] text-[#64625C]">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-11 space-y-9 font-body text-sm sm:text-[15px] text-[#64625C] leading-[1.85]">
            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">1. Processing Time</h2>
              <p>All orders are processed and shipped within <span className="text-[#0D0D0D] font-semibold">1–2 business days</span> of purchase. Orders placed on weekends or holidays will be processed the next business day. You&apos;ll receive a shipping confirmation email with tracking information once your order ships.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">2. Shipping Options</h2>
              <div className="bg-[#EAE8E2] border border-[#0D0D0D]/12 rounded-[2px] p-5">
                <p className="font-semibold text-[#0D0D0D] mb-1">Standard Express Shipping (5–7 business days)</p>
                <p className="text-xs sm:text-sm text-[#64625C]">Tracked domestic delivery for all orders within India.</p>
              </div>
              <p className="text-xs sm:text-sm text-[#64625C] pt-1">Complimentary shipping is unlocked automatically on orders above ₹999.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">3. Shipping Costs</h2>
              <p>Shipping costs are calculated at checkout based on:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>Destination address within India</li>
                <li>Weight and dimensions of package</li>
                <li>Any applicable handling fees</li>
              </ul>
              <p className="pt-1">Free shipping is available on orders above ₹999.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">4. Order Tracking</h2>
              <p>Once your order ships, you&apos;ll receive a tracking number via email. You can use this number to monitor your shipment&apos;s progress through the carrier&apos;s tracking system. We recommend signing up for delivery notifications.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">5. Delivery Address</h2>
              <p>Orders will be shipped to the address provided at checkout. We recommend verifying your address before completing your purchase. We are not responsible for packages delivered to incorrect addresses due to customer error.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">6. Delayed Shipments</h2>
              <p>While we strive to meet all shipping timeframes, occasionally delays occur due to:</p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>High order volume</li>
                <li>Carrier delays or disruptions</li>
                <li>Inclement weather</li>
                <li>Address verification issues</li>
              </ul>
              <p className="pt-1">We&apos;ll keep you updated and work to resolve any delays promptly.</p>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">7. Lost or Damaged Shipments</h2>
              <p>If your package is lost or arrives damaged:</p>
              <ol className="list-decimal pl-6 space-y-1.5">
                <li>Contact us immediately with tracking information and photos</li>
                <li>We will file a claim with the carrier</li>
                <li>Provide a replacement or refund once the claim is resolved</li>
              </ol>
            </section>

            <section className="space-y-3 pt-6 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">8. Contact Information</h2>
              <p>For shipping inquiries, please contact us:</p>
              <div className="bg-[#EAE8E2] border border-[#0D0D0D]/12 rounded-[2px] p-5 mt-3 space-y-1">
                <p className="font-semibold text-[#0D0D0D]">Mystique Apparel Shipping Team</p>
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
