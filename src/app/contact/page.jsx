"use client";

import Newsletter from "@/components/Newsletter";
import { motion } from "framer-motion";
import { Send, Mail, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { FiInstagram } from "react-icons/fi";
import { useState } from "react";
import { client } from "@/sanity";
import { toast } from "react-toastify";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await client.create({
        _type: "contactForm",
        email,
        message,
      });
      setSuccess(true);
      setEmail("");
      setMessage("");
      toast.success("Message received. Our concierge team will respond shortly.");
      setTimeout(() => setSuccess(false), 6000);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Could not send message right now. Please email us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#0D0D0D]">
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="border-b border-[#0D0D0D]/12 pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div className="max-w-2xl">
              <span className="font-mono-tech text-[10px] tracking-[0.34em] uppercase text-[#64625C] block mb-3">
                Client Concierge
              </span>
              <h1 className="font-display italic text-4xl sm:text-5xl md:text-6xl font-semibold text-[#0D0D0D] tracking-[-0.015em]">
                Contact The Atelier
              </h1>
            </div>
            <p className="font-body text-sm text-[#64625C] max-w-sm leading-relaxed">
              Questions on sizing, an existing shipment, or bespoke collaborations? Reach our team directly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Direct Channels */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-8 space-y-6">
                <div className="border-b border-[#0D0D0D]/10 pb-4">
                  <span className="font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] block mb-1">
                    01 // Desk
                  </span>
                  <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                    Direct Channels
                  </h2>
                </div>

                <div className="space-y-3.5">
                  <a
                    href="mailto:apparelmystique1@gmail.com"
                    className="flex items-start gap-4 p-4 rounded-[2px] bg-[#F6F5F1] border border-[#0D0D0D]/10 hover:border-[#0D0D0D] transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center text-[#0D0D0D] flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#64625C]">
                        Email Concierge
                      </p>
                      <p className="font-body text-sm text-[#0D0D0D] font-medium truncate mt-0.5">
                        apparelmystique1@gmail.com
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#64625C] group-hover:text-[#0D0D0D] transition-colors flex-shrink-0" />
                  </a>

                  <a
                    href="https://www.instagram.com/mystique_.apparel/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-[2px] bg-[#F6F5F1] border border-[#0D0D0D]/10 hover:border-[#0D0D0D] transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center text-[#0D0D0D] flex-shrink-0">
                      <FiInstagram className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#64625C]">
                        Instagram DM
                      </p>
                      <p className="font-body text-sm text-[#0D0D0D] font-medium mt-0.5">
                        @mystique_.apparel
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#64625C] group-hover:text-[#0D0D0D] transition-colors flex-shrink-0" />
                  </a>

                  <div className="flex items-start gap-4 p-4 rounded-[2px] bg-[#F6F5F1] border border-[#0D0D0D]/10">
                    <span className="w-10 h-10 rounded-[2px] bg-[#EAE8E2] border border-[#0D0D0D]/10 flex items-center justify-center text-[#0D0D0D] flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="font-mono-tech text-[9px] tracking-[0.24em] uppercase text-[#64625C]">
                        Response Window
                      </p>
                      <p className="font-body text-sm text-[#0D0D0D] font-medium mt-0.5">
                        Within 12–24 Hours (Mon–Sun)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-white border border-[#0D0D0D]/12 rounded-[2px] p-7 sm:p-9">
              <div className="border-b border-[#0D0D0D]/10 pb-4 mb-6">
                <span className="font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] block mb-1">
                  02 // Dispatch
                </span>
                <h2 className="font-display italic text-2xl text-[#0D0D0D]">
                  Send A Note
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="input-atelier w-full px-4 py-3.5 rounded-[2px] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-mono-tech text-[10px] tracking-[0.24em] uppercase text-[#64625C] mb-2">
                    Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your order number, sizing question, or feedback..."
                    rows={6}
                    className="input-atelier w-full px-4 py-3.5 rounded-[2px] text-sm resize-y"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0D0D0D] text-[#F6F5F1] px-9 py-4 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-[#262626] transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? "Dispatching..." : "Send Message"}</span>
                </button>

                {success && (
                  <div className="p-4 rounded-[2px] bg-[#1A5D3A]/6 border border-[#1A5D3A]/25 text-[#1A5D3A] text-xs flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Message received! Our atelier team will reply shortly.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
