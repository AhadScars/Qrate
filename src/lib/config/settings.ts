import { prisma } from "@/lib/db/prisma";

export const SETTING_DEFAULTS = {
  platform_name: "Qrate",
  support_email: "support@qrate.local",
  currency: "INR",
  trial_days: "3",
  plan_name: "5 Year Plan",
  plan_amount_paise: "100000",
  plan_duration_days: "1825",
  terms:
    "Qrate helps a business collect a customer's own feedback and turn it into a draft the customer can edit. The customer copies that draft and submits it on Google themselves. Qrate does not post reviews, buy reviews, or invent experiences.",
  privacy:
    "We store account details, business locations, QR scan events, and the review drafts customers generate. Passwords are hashed. We do not sell personal data. This app does not take card payments.",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SettingMap = Record<SettingKey, string>;

let settingsCache: { at: number; settings: SettingMap } | null = null;

export function clearSettingsCache() {
  settingsCache = null;
}

export async function getSettings(): Promise<SettingMap> {
  if (settingsCache && Date.now() - settingsCache.at < 60_000) return settingsCache.settings;
  const rows = await prisma.adminSetting.findMany();
  const settings = { ...SETTING_DEFAULTS } as SettingMap;
  for (const row of rows) {
    if (row.key in settings) {
      settings[row.key as SettingKey] = row.value;
    }
  }
  settingsCache = { at: Date.now(), settings };
  return settings;
}

export function planFromSettings(settings: SettingMap) {
  const trialDays = positiveInt(settings.trial_days, 3);
  const amountPaise = positiveInt(settings.plan_amount_paise, 100000);
  const durationDays = positiveInt(settings.plan_duration_days, 1825);
  return {
    trialDays,
    amountPaise,
    durationDays,
    planName: settings.plan_name || SETTING_DEFAULTS.plan_name,
    currency: settings.currency || "INR",
    platformName: settings.platform_name || "Qrate",
  };
}

function positiveInt(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.round(parsed);
}
