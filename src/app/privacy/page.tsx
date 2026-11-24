import { SiteFooter, SiteHeader } from "@/components/public/site-header";
import { getSettings, planFromSettings } from "@/lib/config/settings";

export const instant = false;

export default async function PrivacyPage() {
  const settings = await getSettings();
  const plan = planFromSettings(settings);
  return (
    <div>
      <SiteHeader name={plan.platformName} />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-5xl">Privacy</h1>
        <p className="mt-6 whitespace-pre-wrap leading-7 text-stone-700">{settings.privacy}</p>
      </main>
      <SiteFooter name={plan.platformName} />
    </div>
  );
}
