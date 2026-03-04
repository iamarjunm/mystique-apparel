'use client';

import { motion } from 'framer-motion';

export default function ShippingPolicy() {
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
              Shipping Policy
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="w-12 h-[2px] bg-gradient-to-r from-white/50 to-transparent"></div>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">1. Processing Time</h2>
              <p>All orders are processed and shipped within <span className="text-white font-semibold">1-2 business days</span> of purchase. Orders placed on weekends or holidays will be processed the next business day. You'll receive a shipping confirmation email with tracking information once your order ships.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">2. Shipping Options</h2>
              <div className="space-y-3">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="font-semibold text-white mb-1">Standard Shipping (5-7 business days)</p>
                  <p className="text-sm text-gray-400">Standard delivery for all domestic orders within India</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-3">Free shipping is available on orders above ₹999.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">3. Shipping Costs</h2>
              <p>Shipping costs are calculated at checkout based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Destination address within India</li>
                <li>Weight and dimensions of package</li>
                <li>Any applicable handling fees</li>
              </ul>
              <p className="mt-3">Free shipping is available on orders above ₹999.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">4. Order Tracking</h2>
              <p>Once your order ships, you'll receive a tracking number via email. You can use this number to monitor your shipment's progress through the carrier's tracking system. We recommend signing up for delivery notifications.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">5. Delivery Address</h2>
              <p>Orders will be shipped to the address provided at checkout. We recommend verifying your address before completing your purchase. We are not responsible for packages delivered to incorrect addresses due to customer error.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">6. Delayed Shipments</h2>
              <p>While we strive to meet all shipping timeframes, occasionally delays occur due to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>High order volume</li>
                <li>Carrier delays or disruptions</li>
                <li>Inclement weather</li>
                <li>Address verification issues</li>
              </ul>
              <p className="mt-3">We'll keep you updated and work to resolve any delays promptly.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">7. Lost or Damaged Shipments</h2>
              <p>If your package is lost or arrives damaged:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact us immediately with tracking information and photos</li>
                <li>We will file a claim with the carrier</li>
                <li>Provide a replacement or refund once claim is resolved</li>
              </ol>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">8. Contact Information</h2>
              <p>For shipping inquiries, please contact us:</p>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-3">
                <p className="font-semibold">Mystique Apparel Shipping Team</p>
                <p className="text-gray-400">Email: apparelmystique1@gmail.com</p>
                <p className="text-gray-400">Response time: Within 24-48 hours</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
