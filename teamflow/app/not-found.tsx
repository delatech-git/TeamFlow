import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-100 w-100 rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/40">
          404
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Lost in the tide
        </h1>

        <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
          This TeamTide page doesn’t exist or has drifted away.
        </p>

        <Link
          href="/dashboard"
          className="mt-7 rounded-full border-2 border-white px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-slate-950"
        >
          Back to dashboard
        </Link>
      </div>

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60" />
    </section>
  );
}
