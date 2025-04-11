"use client";

import Newsletter from "@/components/Newsletter";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Message sent successfully!`);
    setEmail("");
    setMessage("");
  };

  return (
    <div className="relative bg-black py-20 px-0 border-t border-white/10">
      {/* Subtle Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-black to-black opacity-100"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto text-center relative z-10"
      >
        {/* Premium Heading */}
        <h2 className="text-5xl font-extrabold uppercase tracking-[0.15em] text-white mb-6 leading-[1.2]">
          Contact Us
        </h2>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          Have questions or feedback? Reach out to our team. We’d love to hear from you.
        </p>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-6 max-w-xl mx-auto"
        >
          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email"
            className="w-full px-6 py-4 bg-gray-900 text-white border border-white/30 rounded-full outline-none focus:ring-2 focus:ring-white/60 transition-all duration-300 placeholder-gray-400 text-left tracking-wide"
            required
          />
          {/* Message Textarea */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your Message"
            rows="6"
            className="w-full px-6 py-4 bg-gray-900 text-white border border-white/30 rounded-lg outline-none focus:ring-2 focus:ring-white/60 transition-all duration-300 placeholder-gray-400"
            required
          />
          {/* Submit Button */}
          <button
            type="submit"
            className="self-center mt-4 bg-gradient-to-r from-white to-gray-500 text-black px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:scale-105 flex items-center gap-2 font-bold uppercase tracking-wide"
          >
            <Send className="w-5 h-5" />
            <span className="hidden md:inline">Send Message</span>
          </button>
        </form>
        
        <div className="mt-12 text-gray-400">
          <p className="text-lg">Our team is available 24/7 to assist you with any queries.</p>
          <p className="mt-4">Email us at: <a href="mailto:support@mystiqueapparel.com" className="text-white">support@mystiqueapparel.com</a></p>
        </div>
      </motion.div>
      <section className="pt-40">
      <Newsletter/>
      </section>
    </div>
  );
}
