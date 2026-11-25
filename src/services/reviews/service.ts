import { prisma } from "@/lib/db/prisma";
import { isDirectReviewUrl, resolveGoogleReviewUrl } from "@/lib/qr/google-review";
import { composeReview } from "@/services/reviews/generate";
import type { ReviewLanguage, ReviewLength, ReviewTone } from "@/services/reviews/patterns";
import { getBusinessAccess } from "@/services/subscriptions/service";

const VISITOR_COOKIE = "qrate_visitor";

export async function loadPublicQr(publicId: string) {
  const qr = await prisma.qrCode.findUnique({
    where: { publicId },
    include: {
      place: {
        include: {
          business: true,
          category: { include: { attributes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } } },
        },
      },
    },
  });
  if (!qr || qr.deletedAt || !qr.isActive || !qr.place.isActive || qr.place.deletedAt || qr.place.business.deletedAt) {
    return { ok: false as const, reason: "missing" as const };
  }
  const access = await getBusinessAccess(qr.place.businessId);
  if (!access.allowed) return { ok: false as const, reason: "paused" as const, name: qr.place.business.name };
  const reviewUrl = qr.place.googleReviewUrl;
  if (reviewUrl && !isDirectReviewUrl(reviewUrl)) {
    const resolved = await resolveGoogleReviewUrl(reviewUrl);
    if (resolved !== reviewUrl) {
      await prisma.place.update({ where: { id: qr.place.id }, data: { googleReviewUrl: resolved } });
      qr.place.googleReviewUrl = resolved;
    }
  }
  return { ok: true as const, qr };
}

export async function recordScan(publicId: string, visitorKey: string | null, userAgent: string | null) {
  const loaded = await loadPublicQr(publicId);
  if (!loaded.ok) return { ok: false as const };
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
  if (visitorKey) {
    const recent = await prisma.qrScan.findFirst({
      where: { qrCodeId: loaded.qr.id, visitorKey, createdAt: { gte: since } },
    });
    if (recent) return { ok: true as const, counted: false };
  }
  await prisma.qrScan.create({
    data: {
      qrCodeId: loaded.qr.id,
      visitorKey,
      userAgent: userAgent?.slice(0, 240) ?? null,
    },
  });
  return { ok: true as const, counted: true, cookieName: VISITOR_COOKIE };
}

export async function generatePublicDraft(input: {
  publicId: string;
  rating: number;
  attributeKeys: string[];
  language: ReviewLanguage;
  tone: ReviewTone;
  length: ReviewLength;
  excludeTemplateId?: string;
  avoidText?: string;
}) {
  const loaded = await loadPublicQr(input.publicId);
  if (!loaded.ok) {
    return {
      ok: false as const,
      error: loaded.reason === "paused" ? "Reviews for this business are paused." : "This QR code is not active.",
    };
  }
  const attributes = loaded.qr.place.category.attributes;
  const templates = await prisma.reviewTemplate.findMany({
    where: {
      categoryId: loaded.qr.place.categoryId,
      isActive: true,
      language: input.language,
      tone: input.tone,
      length: input.length,
    },
    take: 40,
  });
  const draft = composeReview({
    businessName: loaded.qr.place.name,
    categoryName: loaded.qr.place.category.name,
    rating: input.rating,
    attributes,
    selectedKeys: input.attributeKeys,
    language: input.language,
    tone: input.tone,
    length: input.length,
    templates,
    seed: Date.now(),
    excludeTemplateIds: input.excludeTemplateId ? [input.excludeTemplateId] : [],
    city: loaded.qr.place.city,
    avoidText: input.avoidText,
  });
  const saved = await prisma.reviewGeneration.create({
    data: {
      placeId: loaded.qr.placeId,
      qrCodeId: loaded.qr.id,
      selectedRating: input.rating,
      selectedAttributes: JSON.stringify(draft.usedKeys),
      generatedContent: draft.text,
      language: input.language,
      tone: input.tone,
      length: input.length,
      templateId: draft.templateId,
    },
  });
  await prisma.reviewEvent.create({ data: { qrCodeId: loaded.qr.id, type: "GENERATE" } });
  return {
    ok: true as const,
    text: draft.text,
    generationId: saved.id,
    templateId: draft.templateId,
  };
}

export async function trackReviewEvent(publicId: string, type: "COPY" | "GOOGLE_CLICK") {
  const loaded = await loadPublicQr(publicId);
  if (!loaded.ok) return { ok: false as const };
  await prisma.reviewEvent.create({ data: { qrCodeId: loaded.qr.id, type } });
  return { ok: true as const };
}

export { VISITOR_COOKIE };
