import Link from "next/link";
import { QrCode, ShieldCheck, Star } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/public/site-header";
import { getSettings, planFromSettings } from "@/lib/config/settings";
import { formatInr } from "@/lib/utils";

export const instant = false;

export default async function HomePage() {
  const settings = await getSettings();
  const plan = planFromSettings(settings);
  return (
    <div>
      <SiteHeader name={plan.platformName} />
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">For shops, clinics, cafes, and gyms</p>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[1.05] text-stone-950 md:text-7xl">
              A review card people finish while they are still at the counter.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-stone-600">
              The customer scans your QR, picks a rating, taps what they actually noticed, and edits a draft. They paste it on Google themselves. {plan.platformName} never posts a review.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">
                Admin login
              </Link>
              <Link href="/pricing" className="rounded-full bg-white px-5 py-3 text-sm font-semibold ring-1 ring-stone-200">
                {formatInr(plan.amountPaise)} for {Math.round(plan.durationDays / 365)} years
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm rounded-[2.2rem] bg-stone-950 p-3 shadow-2xl">
            <div className="rounded-[1.7rem] bg-[#f6f3ee] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Cafe</p>
              <p className="font-display text-3xl">How was the coffee?</p>
              <div className="mt-4 flex gap-2 text-amber-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="fill-amber-400" />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-indigo-700 px-3 py-1 text-white">Coffee quality</span>
                <span className="rounded-full bg-white px-3 py-1">Staff behaviour</span>
                <span className="rounded-full bg-white px-3 py-1">Safai</span>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-3 text-sm leading-6 text-stone-700">
                Maine Corner Cup visit kiya. Main 5 mein se 5 de raha hoon. Main sirf coffee quality ke baare mein likh raha hoon.
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
          {[
            { icon: QrCode, title: "One code per counter", body: "Print it, stick it, and keep the same link if your logo changes." },
            { icon: Star, title: "Drafts from real taps", body: "Stars and topics the customer chose. Another variation if the first wording feels stiff." },
            { icon: ShieldCheck, title: "They hit submit", body: "Copy, open Google, paste. Nothing is sent as if the customer wrote it in secret." },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
              <item.icon className="text-indigo-700" />
              <h2 className="mt-4 font-display text-2xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter name={plan.platformName} />
    </div>
  );
}
