import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[82vh] bg-[#0A0A0A] text-[#F4F2ED] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-lg border border-[#F4F2ED]/14 bg-[#141414] rounded-[2px] px-8 py-14 sm:px-14 sm:py-16">
        <span className="font-mono-tech text-[10px] tracking-[0.38em] uppercase text-[#8E8B84] block mb-4">
          Error 404 // Coordinates Unresolved
        </span>
        <h1 className="font-display italic text-6xl sm:text-7xl font-semibold text-[#F4F2ED] mb-4 tracking-[-0.02em]">
          Not Found
        </h1>
        <div className="w-14 h-px bg-[#F4F2ED]/25 mx-auto mb-6" />
        <p className="font-body text-sm text-[#8E8B84] leading-relaxed mb-9">
          The page or archive piece you are looking for has moved or no longer exists.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#F4F2ED] text-[#0A0A0A] px-8 py-3.5 rounded-[2px] font-body text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-white transition-colors"
          >
            <span>Explore The Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-[2px] border border-[#F4F2ED]/25 text-[#F4F2ED] hover:border-[#F4F2ED] font-body text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
