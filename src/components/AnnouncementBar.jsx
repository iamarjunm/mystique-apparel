"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { client } from "../../sanity";

const DEFAULT_ANNOUNCEMENTS = [
  {
    _id: "default-1",
    text: "Complimentary Express Shipping Across India On Orders Over ₹999",
    code: null,
  },
  {
    _id: "default-2",
    text: "Heavyweight Drop — Unlock 20% Off With Archive Code",
    code: "VOID20",
  },
  {
    _id: "default-3",
    text: "240 GSM Combed Cotton — Crafted In Small Batches",
    code: null,
  },
];

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState(DEFAULT_ANNOUNCEMENTS);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const query = `*[_type == "announcementBar" && active == true]|order(order asc){
          _id,
          text,
          code
        }`;
        const data = await client.fetch(query);
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error("[ANNOUNCEMENT] Error fetching:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleCopyCode = (code) => {
    if (!code || typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1800);
    });
  };

  return (
    <div className="bg-[#0A0A0A] text-[#F4F2ED] h-8 overflow-hidden flex items-center relative z-50 border-b border-white/[0.1]">
      <div className="animate-marquee items-center">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center">
            {[0, 1, 2].map((repeat) =>
              announcements.map((item, idx) => (
                <div
                  key={`${dup}-${repeat}-${item._id || idx}`}
                  className="flex items-center whitespace-nowrap"
                >
                  <span className="font-mono-tech text-[9px] sm:text-[10px] tracking-[0.24em] uppercase px-6 sm:px-9 text-[#F4F2ED]/80 inline-flex items-center gap-2.5">
                    <span>{item.text}</span>
                    {item.code && (
                      <button
                        type="button"
                        onClick={() => handleCopyCode(item.code)}
                        title="Click to copy promo code"
                        className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#F4F2ED]/35 text-[#F4F2ED] hover:bg-[#F4F2ED] hover:text-[#0A0A0A] transition-colors font-mono-tech text-[9px] tracking-[0.18em] cursor-pointer"
                      >
                        {copiedCode === item.code ? (
                          <>
                            <Check className="w-2.5 h-2.5" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <span>{item.code}</span>
                            <Copy className="w-2.5 h-2.5 opacity-70" />
                          </>
                        )}
                      </button>
                    )}
                  </span>
                  <span className="text-[#F4F2ED]/25 text-[8px]">/</span>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
