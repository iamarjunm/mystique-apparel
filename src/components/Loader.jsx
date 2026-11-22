import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 py-12">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border border-[#0D0D0D]/15" />
        <div className="absolute inset-0 rounded-full border-t border-[#0D0D0D] animate-spin" />
      </div>
      <span className="font-mono-tech text-[10px] tracking-[0.36em] uppercase text-[#64625C]">
        Loading Atelier...
      </span>
    </div>
  );
};

export default Loader;
