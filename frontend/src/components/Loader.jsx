export default function FullscreenLoader({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#003B95]/20 border-t-[#003B95]" />
      <p className="mt-4 text-sm font-semibold text-[#003B95]">{text}</p>
    </div>
  );
}