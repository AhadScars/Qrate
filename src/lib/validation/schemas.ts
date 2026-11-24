import { z } from "zod";

const emptyOrUrl = z.union([z.literal(""), z.string().trim().url().max(500)]);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
  businessName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(72),
});

export const forgotSchema = z.object({
  email: z.string().trim().email().max(160),
});

export const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(8).max(72),
});

export const adminQrSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  placeName: z.string().trim().max(120).optional().or(z.literal("")),
  categoryId: z.string().min(1),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  googleMapsUrl: emptyOrUrl.optional(),
  googleReviewUrl: z
    .string()
    .trim()
    .min(8)
    .max(500)
    .refine((value) => /^ChIJ[A-Za-z0-9_-]{10,120}$/.test(value) || /^https:\/\/(?:maps\.app\.goo\.gl|goo\.gl|g\.page|maps\.google\.com|www\.google\.com|google\.com|search\.google\.com)\//i.test(value), "Paste a Google Maps share link, like https://maps.app.goo.gl/..., or a Place ID that starts with ChIJ."),
  welcomeMessage: z.string().trim().max(280).optional().or(z.literal("")),
});

export const placeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  categoryId: z.string().min(1),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  googleBusinessName: z.string().trim().max(160).optional().or(z.literal("")),
  googleMapsUrl: emptyOrUrl,
  googleReviewUrl: emptyOrUrl,
  welcomeMessage: z.string().trim().max(280).optional().or(z.literal("")),
});

export const qrStyleSchema = z.object({
  qrId: z.string().min(1),
  label: z.string().trim().max(80).optional().or(z.literal("")),
  fgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  includeLogo: z.boolean(),
});

export const generateSchema = z.object({
  publicId: z.string().min(4).max(32),
  rating: z.number().int().min(1).max(5),
  attributeKeys: z.array(z.string().min(1).max(80)).max(12),
  language: z.enum(["en", "hi", "hinglish"]),
  tone: z.enum(["natural", "professional", "friendly", "simple"]),
  length: z.enum(["short", "medium", "detailed"]),
  excludeTemplateId: z.string().optional().or(z.literal("")),
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const templateSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1),
  language: z.enum(["en", "hi", "hinglish"]),
  tone: z.enum(["natural", "professional", "friendly", "simple"]),
  length: z.enum(["short", "medium", "detailed"]),
  ratingBand: z.enum(["high", "mid", "low"]),
  content: z.string().trim().min(20).max(1200),
  isActive: z.boolean(),
});

export const categorySchema = z.object({
  id: z.string().optional().or(z.literal("")),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().or(z.literal("")),
  icon: z.string().trim().max(40).optional().or(z.literal("")),
  welcomeMessage: z.string().trim().max(280).optional().or(z.literal("")),
  isActive: z.boolean(),
  attributes: z
    .array(
      z.object({
        key: z.string().trim().min(1).max(40),
        label: z.string().trim().min(2).max(80),
        labelHi: z.string().trim().min(1).max(80),
        labelHinglish: z.string().trim().min(1).max(80),
      }),
    )
    .min(1)
    .max(12),
});

export const settingsSchema = z.object({
  platform_name: z.string().trim().min(2).max(40),
  support_email: z.string().trim().email().max(160),
  currency: z.string().trim().min(3).max(8),
  trial_days: z.coerce.number().int().min(1).max(30),
  plan_name: z.string().trim().min(2).max(80),
  plan_amount_paise: z.coerce.number().int().min(100).max(100_000_00),
  plan_duration_days: z.coerce.number().int().min(1).max(3650),
  terms: z.string().trim().min(20).max(5000),
  privacy: z.string().trim().min(20).max(5000),
});

export const activateSchema = z.object({
  businessId: z.string().min(1),
  reference: z.string().trim().min(3).max(120),
});

export const extendSchema = z.object({
  businessId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(3650),
});

export function zodError(error: z.ZodError) {
  return error.issues[0]?.message || "Check the form and try again.";
}
