import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-5xl">That page is not here</h1>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">
        Go home
      </Link>
    </main>
  );
}
