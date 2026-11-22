"use client";

const MARQUEE_ITEMS = [
  { text: "240–280 GSM Heavyweight Cotton", highlight: true },
  { text: "Architectural Drop-Shoulder Block", highlight: false },
  { text: "Enzyme Bio-Washed Finish", highlight: false },
  { text: "Numbered Small-Batch Runs", highlight: true },
  { text: "Noir Atelier × Studio Gallery", highlight: false },
  { text: "Hand-Inspected In India", highlight: true },
  { text: "Pre-Shrunk Precision Drape", highlight: false },
];

export default function MarqueeBanner() {
  return (
    <div className="relative overflow-hidden py-3.5 sm:py-4 bg-[#0A0A0A] border-y border-white/[0.12]">
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee-slow items-center">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center">
            {[0, 1].map((rep) =>
              MARQUEE_ITEMS.map((item, idx) => (
                <div
                  key={`${dup}-${rep}-${idx}`}
                  className="flex items-center whitespace-nowrap"
                >
                  <span
                    className={`font-mono-tech text-[10px] sm:text-[11px] tracking-[0.3em] uppercase px-6 sm:px-9 ${
                      item.highlight ? "text-[#F4F2ED]" : "text-[#8E8B84]"
                    }`}
                  >
                    {item.text}
                  </span>
                  <span className="w-1 h-1 bg-white/25 inline-block" />
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
