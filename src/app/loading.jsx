export default function Loading() {
  return (
    <div className="min-h-[75vh] bg-[#F6F5F1] text-[#0D0D0D] flex flex-col items-center justify-center gap-5">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border border-[#0D0D0D]/15" />
        <div className="absolute inset-0 rounded-full border-t border-[#0D0D0D] animate-spin" />
      </div>
      <span className="font-mono-tech text-[10px] tracking-[0.38em] uppercase text-[#64625C]">
        Mystique Atelier
      </span>
    </div>
  );
}
