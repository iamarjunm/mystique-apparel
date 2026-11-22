"use client";

import { motion } from "framer-motion";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D] py-14 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          <div className="border-b border-[#0D0D0D]/12 pb-8 space-y-3">
            <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block">
              Legal // Returns &amp; Exchanges
            </span>
            <h1 className="font-display italic text-4xl sm:text-5xl font-bold text-[#0D0D0D]">
              Refund Policy
            </h1>
            <p className="font-mono-tech text-xs text-[#64625C]">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-10 space-y-8 font-body text-sm sm:text-[15px] text-[#0D0D0D]/80 leading-[1.85]">
            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                1. Return Eligibility
              </h2>
              <p>
                We want you to be completely confident in your Mystique Apparel garments. If you are not satisfied with your order, we offer returns within <strong className="text-[#0D0D0D]">30 days</strong> of delivery provided items are:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-[#64625C]">
                <li>Unused, unwashed, and in original condition</li>
                <li>With all original woven tags attached</li>
                <li>In original protective packaging</li>
                <li>Free from wear, perfume, or customer misuse</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                2. Non-Returnable Items
              </h2>
              <ul className="list-disc pl-6 space-y-1.5 text-[#64625C]">
                <li>Final sale or archive clearance items</li>
                <li>Custom or personalized pieces</li>
                <li>Items purchased more than 30 days ago</li>
                <li>Items showing signs of wear or washing</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                3. How To Initiate A Return
              </h2>
              <ol className="list-decimal pl-6 space-y-1.5 text-[#64625C]">
                <li>Email our atelier concierge at apparelmystique1@gmail.com</li>
                <li>Include your order number and reason for return or exchange</li>
                <li>Receive your Return Authorization (RA) instructions</li>
                <li>Dispatch the parcel with the RA reference clearly marked</li>
              </ol>
            </section>

            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                4. Exchanges &amp; Defective Items
              </h2>
              <p>
                Need a different size? Contact us within 30 days with your order reference and preferred size. If you receive a defective or transit-damaged garment, reach out within 7 days with clear photos and we will arrange a full replacement or refund at zero cost.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                5. Refund Processing
              </h2>
              <p>
                Approved refunds are issued to your original payment method after quality inspection. Please allow 5–10 business days for funds to reflect depending on your bank or UPI provider. Store credit equal to 110% of the refund value is also available upon request.
              </p>
            </section>

            <section className="space-y-3 pt-4 border-t border-[#0D0D0D]/10">
              <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                6. Concierge Contact
              </h2>
              <div className="bg-[#F6F5F1] border border-[#0D0D0D]/10 p-5 space-y-1 font-mono-tech text-xs">
                <p className="font-semibold text-[#0D0D0D]">
                  Mystique Apparel Returns Atelier
                </p>
                <p className="text-[#64625C]">
                  Email:{" "}
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
