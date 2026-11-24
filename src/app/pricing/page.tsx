import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/public/site-header";
import { getSettings, planFromSettings } from "@/lib/config/settings";
import { formatInr } from "@/lib/utils";

export const instant = false;

export default async function PricingPage() {
  const settings = await getSettings();
  const plan = planFromSettings(settings);
  return (
    <div>
      <SiteHeader name={plan.platformName} />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">Pricing</p>
        <h1 className="mt-2 font-display text-5xl">One plan. No seat maths.</h1>
        <div className="mt-8 rounded-[2rem] bg-white p-8 ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">{plan.planName}</p>
          <p className="font-display text-6xl">{formatInr(plan.amountPaise)}</p>
          <p className="text-stone-600">for {plan.durationDays} days, about {Math.round(plan.durationDays / 365)} years.</p>
          <ul className="mt-6 space-y-2 text-sm text-stone-700">
            <li>{plan.trialDays}-day trial from the moment the account is created.</li>
            <li>Locations, QR codes, scan counts, and review drafts.</li>
            <li>Hindi, Hinglish, and English drafts in a few tones.</li>
            <li>After the trial, public QR pages pause until a payment is confirmed.</li>
          </ul>
          <Link href="/login" className="mt-8 inline-flex rounded-full bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">
            Admin login
          </Link>
        </div>
      </main>
      <SiteFooter name={plan.platformName} />
    </div>
  );
}
