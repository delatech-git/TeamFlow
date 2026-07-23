import { Loader2 } from "lucide-react";

export function LoadingOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message: string;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4 bg-[#050b16]/80 backdrop-blur-sm">
      <Loader2
        size={40}
        className="animate-spin text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.5)]"
        aria-hidden
      />
      <p className="text-sm font-semibold text-slate-200">{message}</p>
    </div>
  );
}
