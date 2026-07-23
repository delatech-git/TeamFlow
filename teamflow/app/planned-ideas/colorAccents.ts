export type Accent = {
  border: string;
  bg: string;
  text: string;
  avatarBg: string;
  dot: string;
  solidBg: string;
};

const PALETTE: Accent[] = [
  { border: "border-cyan-400/50", bg: "bg-cyan-500/15", text: "text-cyan-200", avatarBg: "bg-cyan-500/20", dot: "bg-cyan-300/60", solidBg: "bg-cyan-600" },
  { border: "border-violet-400/50", bg: "bg-violet-500/15", text: "text-violet-200", avatarBg: "bg-violet-500/20", dot: "bg-violet-300/60", solidBg: "bg-violet-600" },
  { border: "border-amber-400/50", bg: "bg-amber-500/15", text: "text-amber-200", avatarBg: "bg-amber-500/20", dot: "bg-amber-300/60", solidBg: "bg-amber-600" },
  { border: "border-rose-400/50", bg: "bg-rose-500/15", text: "text-rose-200", avatarBg: "bg-rose-500/20", dot: "bg-rose-300/60", solidBg: "bg-rose-600" },
  { border: "border-emerald-400/50", bg: "bg-emerald-500/15", text: "text-emerald-200", avatarBg: "bg-emerald-500/20", dot: "bg-emerald-300/60", solidBg: "bg-emerald-600" },
  { border: "border-blue-400/50", bg: "bg-blue-500/15", text: "text-blue-200", avatarBg: "bg-blue-500/20", dot: "bg-blue-300/60", solidBg: "bg-blue-600" },
  { border: "border-fuchsia-400/50", bg: "bg-fuchsia-500/15", text: "text-fuchsia-200", avatarBg: "bg-fuchsia-500/20", dot: "bg-fuchsia-300/60", solidBg: "bg-fuchsia-600" },
];

// Deterministic color per key so the same author/section always gets the same accent.
export function hashAccent(key: string): Accent {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// The guide always has its 10 sections in the same fixed order, so cycling
// by position works regardless of what language the section titles are in.
export function accentForIndex(index: number): Accent {
  return PALETTE[index % PALETTE.length];
}
