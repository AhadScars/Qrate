import Link from "next/link";
import { DigiHubMark } from "@/components/brand";

export function SiteHeader({ name }: { name: string }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
      <Link href="/" className="font-display text-2xl tracking-tight">
        {name}
      </Link>
      <nav className="flex items-center gap-2 text-sm font-semibold">
        <Link href="/login" className="rounded-full bg-indigo-700 px-4 py-2 text-white">
          Admin login
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter({ name }: { name: string }) {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-10 text-sm text-stone-500">
      <div>
        <p>{name} drafts reviews from what the customer actually selects.</p>
        <DigiHubMark className="mt-1" />
      </div>
      <div className="flex gap-4">
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </div>
    </footer>
  );
}
