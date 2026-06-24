"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
          <section className="max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">
              TeamTide
            </p>
            <h1 className="mt-3 text-3xl font-bold">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-white/72">
              The workspace could not be loaded. Try again, and we will restart this view.
            </p>
            {error.digest ? (
              <p className="mt-3 text-xs text-white/50">Error digest: {error.digest}</p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full bg-sky-300 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-200"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}