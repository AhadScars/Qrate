"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { audit } from "@/lib/audit";
import { activateSchema, adminQrSchema, categorySchema, extendSchema, settingsSchema, templateSchema, zodError } from "@/lib/validation/schemas";
import { deleteIssuedQr, issueAdminQr } from "@/services/places/service";
import { SETTING_DEFAULTS } from "@/lib/config/settings";
import { slugify } from "@/lib/utils";
import {
  activatePaidPlan,
  archiveBusiness,
  disableTrial,
  extendAccess,
  suspendBusiness,
  unsuspendBusiness,
} from "@/services/subscriptions/service";
import { canImportTemplates, LANGUAGES, LENGTHS, TONES, BANDS } from "@/services/reviews/patterns";
import { parseCsv } from "@/lib/csv";

export async function adminActivateAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = activateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  await activatePaidPlan({
    businessId: parsed.data.businessId,
    actorId: admin.id,
    reference: parsed.data.reference,
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminMarkPaymentAction(paymentId: string, reference: string) {
  const admin = await requireAdmin();
  const ref = reference.trim();
  if (ref.length < 3) return { ok: false as const, error: "Enter the payment reference." };
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === "PAID") return { ok: false as const, error: "That payment cannot be marked paid." };
  await activatePaidPlan({
    businessId: payment.businessId,
    actorId: admin.id,
    reference: ref,
    paymentId: payment.id,
    provider: payment.provider,
  });
  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  return { ok: true as const };
}

export async function adminExtendAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = extendSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  await extendAccess(parsed.data.businessId, parsed.data.days, admin.id);
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminSuspendAction(businessId: string) {
  const admin = await requireAdmin();
  await suspendBusiness(businessId, admin.id);
  revalidatePath("/admin/businesses");
  return { ok: true as const };
}

export async function adminUnsuspendAction(businessId: string) {
  const admin = await requireAdmin();
  await unsuspendBusiness(businessId, admin.id);
  revalidatePath("/admin/businesses");
  return { ok: true as const };
}

export async function adminDisableTrialAction(businessId: string) {
  const admin = await requireAdmin();
  await disableTrial(businessId, admin.id);
  revalidatePath("/admin/trials");
  return { ok: true as const };
}

export async function adminArchiveBusinessAction(businessId: string) {
  const admin = await requireAdmin();
  await archiveBusiness(businessId, admin.id);
  revalidatePath("/admin/businesses");
  return { ok: true as const };
}

export async function adminSaveCategoryAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const id = parsed.data.id || "";
  const data = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    icon: parsed.data.icon || "store",
    welcomeMessage: parsed.data.welcomeMessage || null,
    isActive: parsed.data.isActive,
  };
  const category = id
    ? await prisma.category.update({ where: { id }, data })
    : await prisma.category.create({
        data: { ...data, slug: `${slugify(parsed.data.name)}-${Date.now().toString(36)}` },
      });
  await prisma.categoryAttribute.deleteMany({ where: { categoryId: category.id } });
  await prisma.categoryAttribute.createMany({
    data: parsed.data.attributes.map((attribute, index) => ({
      categoryId: category.id,
      key: slugify(attribute.key),
      label: attribute.label,
      labelHi: attribute.labelHi,
      labelHinglish: attribute.labelHinglish,
      sortOrder: index,
    })),
  });
  await audit(admin.id, "category.save", "Category", category.id);
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function adminArchiveCategoryAction(categoryId: string) {
  const admin = await requireAdmin();
  const inUse = await prisma.place.count({ where: { categoryId, deletedAt: null } });
  if (inUse > 0) return { ok: false as const, error: "This category still has locations. Move them first." };
  await prisma.category.update({ where: { id: categoryId }, data: { isActive: false } });
  await audit(admin.id, "category.archive", "Category", categoryId);
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function adminSaveTemplateAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = templateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  if (!parsed.data.content.includes("{business}") || !parsed.data.content.includes("{attributes}")) {
    return { ok: false as const, error: "Use the {business} and {attributes} tokens so drafts stay tied to the customer." };
  }
  const data = {
    categoryId: parsed.data.categoryId,
    language: parsed.data.language,
    tone: parsed.data.tone,
    length: parsed.data.length,
    ratingBand: parsed.data.ratingBand,
    content: parsed.data.content,
    isActive: parsed.data.isActive,
  };
  const saved = parsed.data.id
    ? await prisma.reviewTemplate.update({ where: { id: parsed.data.id }, data })
    : await prisma.reviewTemplate.create({ data });
  await audit(admin.id, "template.save", "ReviewTemplate", saved.id);
  revalidatePath("/admin/review-templates");
  return { ok: true as const };
}

export async function adminDeleteTemplateAction(templateId: string) {
  const admin = await requireAdmin();
  await prisma.reviewTemplate.delete({ where: { id: templateId } });
  await audit(admin.id, "template.delete", "ReviewTemplate", templateId);
  revalidatePath("/admin/review-templates");
  return { ok: true as const };
}

export async function adminImportTemplatesAction(csv: string) {
  const admin = await requireAdmin();
  const table = parseCsv(csv);
  const [header, ...body] = table;
  if (!header) return { ok: false as const, error: "The CSV is empty." };
  const expected = ["categorySlug", "language", "tone", "length", "ratingBand", "content", "isActive"];
  if (expected.some((column, index) => header[index] !== column)) {
    return { ok: false as const, error: `Header must be ${expected.join(",")}` };
  }
  const existing = await prisma.reviewTemplate.count();
  const room = canImportTemplates(existing, body.length);
  if (!room.ok) return room;
  const categories = await prisma.category.findMany();
  const bySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const rows = [];
  for (const cells of body) {
    const [categorySlug, language, tone, length, ratingBand, content, isActive] = cells;
    const categoryId = bySlug.get(categorySlug || "");
    if (!categoryId) return { ok: false as const, error: `Unknown category slug ${categorySlug}.` };
    if (!LANGUAGES.includes(language as (typeof LANGUAGES)[number])) return { ok: false as const, error: `Bad language ${language}.` };
    if (!TONES.includes(tone as (typeof TONES)[number])) return { ok: false as const, error: `Bad tone ${tone}.` };
    if (!LENGTHS.includes(length as (typeof LENGTHS)[number])) return { ok: false as const, error: `Bad length ${length}.` };
    if (!BANDS.includes(ratingBand as (typeof BANDS)[number])) return { ok: false as const, error: `Bad rating band ${ratingBand}.` };
    if (!content?.includes("{business}") || !content.includes("{attributes}")) {
      return { ok: false as const, error: "Every row needs {business} and {attributes}." };
    }
    rows.push({
      categoryId,
      language,
      tone,
      length,
      ratingBand,
      content,
      isActive: isActive !== "false" && isActive !== "0",
    });
  }
  await prisma.reviewTemplate.createMany({ data: rows });
  await audit(admin.id, "template.import", "ReviewTemplate", null, { count: rows.length });
  revalidatePath("/admin/review-templates");
  return { ok: true as const, count: rows.length };
}

export async function adminSaveSettingsAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const entries = Object.entries(parsed.data) as [keyof typeof SETTING_DEFAULTS, string | number][];
  for (const [key, value] of entries) {
    await prisma.adminSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  await audit(admin.id, "settings.save", "AdminSetting", "platform");
  revalidatePath("/admin/settings");
  revalidatePath("/pricing");
  return { ok: true as const };
}

export async function adminUpdateBusinessAction(input: { businessId: string; name: string; phone?: string }) {
  const admin = await requireAdmin();
  if (!input.name || input.name.trim().length < 2) return { ok: false as const, error: "Enter the business name." };
  await prisma.business.update({
    where: { id: input.businessId },
    data: { name: input.name.trim(), phone: input.phone?.trim() || null },
  });
  await audit(admin.id, "business.edit", "Business", input.businessId);
  revalidatePath("/admin/businesses");
  return { ok: true as const };
}

export async function adminCreateQrAction(input: unknown) {
  const admin = await requireAdmin();
  const parsed = adminQrSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const issued = await issueAdminQr({ actorId: admin.id, ...parsed.data });
  if (!issued.ok) return issued;
  revalidatePath("/admin/qr");
  revalidatePath("/admin/overview");
  revalidatePath("/admin/places");
  revalidatePath("/admin/businesses");
  return { ok: true as const, publicId: issued.qr?.publicId ?? "" };
}

export async function adminSetQrActiveAction(qrId: string, isActive: boolean) {
  const admin = await requireAdmin();
  const qr = await prisma.qrCode.findFirst({ where: { id: qrId, deletedAt: null } });
  if (!qr) return { ok: false as const, error: "That QR code was not found." };
  await prisma.qrCode.update({ where: { id: qr.id }, data: { isActive } });
  await audit(admin.id, isActive ? "qr.activate" : "qr.deactivate", "QrCode", qr.id);
  revalidatePath("/admin/overview");
  revalidatePath("/admin/qr");
  return { ok: true as const };
}

export async function adminDeleteQrAction(qrId: string) {
  const admin = await requireAdmin();
  const deleted = await deleteIssuedQr(admin.id, qrId);
  if (!deleted.ok) return deleted;
  revalidatePath("/admin/overview");
  revalidatePath("/admin/qr");
  revalidatePath("/admin/places");
  revalidatePath("/admin/businesses");
  revalidatePath(`/r/${deleted.publicId}`);
  return { ok: true as const };
}

export async function adminSetValidityAction(businessId: string, endDate: string) {
  const admin = await requireAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return { ok: false as const, error: "Pick a valid date." };
  const end = new Date(`${endDate}T23:59:59+05:30`);
  if (Number.isNaN(end.getTime())) return { ok: false as const, error: "Pick a valid date." };
  const business = await prisma.business.findFirst({ where: { id: businessId, deletedAt: null } });
  if (!business) return { ok: false as const, error: "That customer was not found." };
  const open = end > new Date();
  const latest = await prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    await prisma.subscription.update({
      where: { id: latest.id },
      data: {
        endDate: end,
        status: open ? "ACTIVE" : "EXPIRED",
        paymentStatus: "PAID",
        paymentRef: latest.paymentRef ?? "ADMIN-ISSUED",
      },
    });
  } else {
    await prisma.subscription.create({
      data: {
        businessId,
        planName: "Admin plan",
        amountPaise: 0,
        status: open ? "ACTIVE" : "EXPIRED",
        startDate: new Date(),
        endDate: end,
        paymentStatus: "PAID",
        paymentRef: "ADMIN-ISSUED",
      },
    });
  }
  await prisma.trial.updateMany({
    where: { businessId },
    data: { endDate: end, isDisabled: !open },
  });
  if (open && business.status !== "SUSPENDED") {
    await prisma.business.update({ where: { id: business.id }, data: { status: "ACTIVE" } });
  }
  await audit(admin.id, "subscription.validity", "Business", business.id, { endDate });
  revalidatePath("/admin/overview");
  return { ok: true as const };
}

export async function adminArchivePlaceAction(placeId: string) {
  const admin = await requireAdmin();
  await prisma.$transaction([
    prisma.place.update({ where: { id: placeId }, data: { isActive: false, deletedAt: new Date() } }),
    prisma.qrCode.updateMany({ where: { placeId }, data: { isActive: false, deletedAt: new Date() } }),
  ]);
  await audit(admin.id, "place.archive", "Place", placeId);
  revalidatePath("/admin/places");
  return { ok: true as const };
}
