"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-stone-600">{error.message}</p>
      <button className="mt-6 rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
