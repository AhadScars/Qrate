import { addDays } from "date-fns";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { audit } from "@/lib/audit";
import { planFromSettings, getSettings } from "@/lib/config/settings";
import { isDirectReviewUrl, placeIdFromInput, reviewUrlFromPlaceId } from "@/lib/qr/google-review";
import { slugify } from "@/lib/utils";
import { getBusinessAccess } from "@/services/subscriptions/service";

const publicId = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

export async function issueAdminQr(input: {
  actorId: string;
  businessName: string;
  placeName?: string;
  categoryId: string;
  address?: string;
  city?: string;
  googleMapsUrl?: string;
  googleReviewUrl: string;
  welcomeMessage?: string;
}) {
  const category = await prisma.category.findFirst({ where: { id: input.categoryId, isActive: true } });
  if (!category) return { ok: false as const, error: "Choose a valid category." };

  const placeName = input.placeName?.trim() || input.businessName;
  const placeId = placeIdFromInput(input.googleReviewUrl);
  if (!placeId) return { ok: false as const, error: "Enter only the Google Place ID. It starts with ChIJ." };
  const googleReviewUrl = reviewUrlFromPlaceId(placeId);
  if (!isDirectReviewUrl(googleReviewUrl)) return { ok: false as const, error: "That Place ID could not be turned into a Google review link." };
  const business = await prisma.business.create({
    data: {
      ownerId: input.actorId,
      name: input.businessName.trim(),
      slug: await uniqueSlug(input.businessName),
      status: "ACTIVE",
      members: { create: { userId: input.actorId, role: "OWNER" } },
    },
  });

  const settings = await getSettings();
  const plan = planFromSettings(settings);
  const now = new Date();
  await prisma.subscription.create({
    data: {
      businessId: business.id,
      planName: plan.planName,
      amountPaise: 0,
      currency: plan.currency,
      status: "ACTIVE",
      startDate: now,
      endDate: addDays(now, plan.durationDays),
      paymentStatus: "PAID",
      paymentRef: "ADMIN-ISSUED",
    },
  });

  const place = await prisma.place.create({
    data: {
      businessId: business.id,
      categoryId: category.id,
      name: placeName,
      address: blank(input.address),
      city: blank(input.city),
      googleMapsUrl: blank(input.googleMapsUrl),
      googleReviewUrl,
      welcomeMessage: blank(input.welcomeMessage),
      qrCodes: { create: { publicId: await uniquePublicId(), label: "Main counter" } },
    },
    include: { qrCodes: true },
  });
  await audit(input.actorId, "admin.qr.issue", "QrCode", place.qrCodes[0]?.id, { businessId: business.id });
  return { ok: true as const, place, qr: place.qrCodes[0] };
}

export async function createPlace(input: {
  businessId: string;
  actorId: string;
  name: string;
  categoryId: string;
  address?: string;
  city?: string;
  googleBusinessName?: string;
  googleMapsUrl?: string;
  googleReviewUrl?: string;
  welcomeMessage?: string;
}) {
  const access = await getBusinessAccess(input.businessId);
  if (!access.allowed) return { ok: false as const, error: access.reason };

  const category = await prisma.category.findFirst({ where: { id: input.categoryId, isActive: true } });
  if (!category) return { ok: false as const, error: "Choose a valid category." };

  const place = await prisma.place.create({
    data: {
      businessId: input.businessId,
      categoryId: category.id,
      name: input.name,
      address: blank(input.address),
      city: blank(input.city),
      googleBusinessName: blank(input.googleBusinessName),
      googleMapsUrl: blank(input.googleMapsUrl),
      googleReviewUrl: blank(input.googleReviewUrl),
      welcomeMessage: blank(input.welcomeMessage),
      qrCodes: {
        create: {
          publicId: await uniquePublicId(),
          label: "Main counter",
        },
      },
    },
    include: { qrCodes: true },
  });
  await audit(input.actorId, "place.create", "Place", place.id);
  return { ok: true as const, place };
}

export async function updatePlace(input: {
  businessId: string;
  actorId: string;
  placeId: string;
  name: string;
  categoryId: string;
  address?: string;
  city?: string;
  googleBusinessName?: string;
  googleMapsUrl?: string;
  googleReviewUrl?: string;
  welcomeMessage?: string;
}) {
  const access = await getBusinessAccess(input.businessId);
  if (!access.allowed) return { ok: false as const, error: access.reason };
  const owned = await prisma.place.findFirst({
    where: { id: input.placeId, businessId: input.businessId, deletedAt: null },
  });
  if (!owned) return { ok: false as const, error: "That location was not found." };
  const category = await prisma.category.findFirst({ where: { id: input.categoryId, isActive: true } });
  if (!category) return { ok: false as const, error: "Choose a valid category." };

  const place = await prisma.place.update({
    where: { id: owned.id },
    data: {
      name: input.name,
      categoryId: category.id,
      address: blank(input.address),
      city: blank(input.city),
      googleBusinessName: blank(input.googleBusinessName),
      googleMapsUrl: blank(input.googleMapsUrl),
      googleReviewUrl: blank(input.googleReviewUrl),
      welcomeMessage: blank(input.welcomeMessage),
    },
  });
  await audit(input.actorId, "place.update", "Place", place.id);
  return { ok: true as const, place };
}

export async function archivePlace(businessId: string, actorId: string, placeId: string) {
  const owned = await prisma.place.findFirst({ where: { id: placeId, businessId, deletedAt: null } });
  if (!owned) return { ok: false as const, error: "That location was not found." };
  await prisma.$transaction([
    prisma.place.update({ where: { id: owned.id }, data: { isActive: false, deletedAt: new Date() } }),
    prisma.qrCode.updateMany({ where: { placeId: owned.id }, data: { isActive: false, deletedAt: new Date() } }),
  ]);
  await audit(actorId, "place.archive", "Place", owned.id);
  return { ok: true as const };
}

export async function addQrCode(businessId: string, actorId: string, placeId: string) {
  const access = await getBusinessAccess(businessId);
  if (!access.allowed) return { ok: false as const, error: access.reason };
  const place = await prisma.place.findFirst({ where: { id: placeId, businessId, deletedAt: null, isActive: true } });
  if (!place) return { ok: false as const, error: "That location was not found." };
  const qr = await prisma.qrCode.create({
    data: { placeId: place.id, publicId: await uniquePublicId(), label: "Extra code" },
  });
  await audit(actorId, "qr.create", "QrCode", qr.id);
  return { ok: true as const, qr };
}

export async function updateQrStyle(input: {
  businessId: string;
  actorId: string;
  qrId: string;
  label?: string;
  fgColor: string;
  bgColor: string;
  includeLogo: boolean;
}) {
  const qr = await prisma.qrCode.findFirst({
    where: { id: input.qrId, deletedAt: null, place: { businessId: input.businessId, deletedAt: null } },
  });
  if (!qr) return { ok: false as const, error: "That QR code was not found." };
  const updated = await prisma.qrCode.update({
    where: { id: qr.id },
    data: {
      label: blank(input.label),
      fgColor: input.fgColor,
      bgColor: input.bgColor,
      includeLogo: input.includeLogo,
    },
  });
  await audit(input.actorId, "qr.style", "QrCode", qr.id);
  return { ok: true as const, qr: updated };
}

export async function setQrActive(businessId: string, actorId: string, qrId: string, isActive: boolean) {
  const access = await getBusinessAccess(businessId);
  if (isActive && !access.allowed) return { ok: false as const, error: access.reason };
  const qr = await prisma.qrCode.findFirst({
    where: { id: qrId, deletedAt: null, place: { businessId, deletedAt: null } },
  });
  if (!qr) return { ok: false as const, error: "That QR code was not found." };
  await prisma.qrCode.update({ where: { id: qr.id }, data: { isActive } });
  await audit(actorId, isActive ? "qr.activate" : "qr.deactivate", "QrCode", qr.id);
  return { ok: true as const };
}

export async function deleteIssuedQr(actorId: string, qrId: string) {
  const qr = await prisma.qrCode.findUnique({
    where: { id: qrId },
    include: {
      place: {
        include: {
          business: true,
          qrCodes: { select: { id: true } },
        },
      },
    },
  });
  if (!qr) return { ok: false as const, error: "That QR code was not found." };

  const placeId = qr.placeId;
  const businessId = qr.place.businessId;
  const onlyQrOnPlace = qr.place.qrCodes.every((code) => code.id === qr.id);
  const otherPlaces = await prisma.place.count({ where: { businessId, id: { not: placeId } } });

  await prisma.$transaction(async (tx) => {
    await tx.qrCode.delete({ where: { id: qr.id } });
    if (onlyQrOnPlace) await tx.place.delete({ where: { id: placeId } });
    if (onlyQrOnPlace && otherPlaces === 0) await tx.business.delete({ where: { id: businessId } });
  });

  await audit(actorId, "qr.delete", "QrCode", qr.id, {
    publicId: qr.publicId,
    businessId,
    businessName: qr.place.business.name,
  });
  return { ok: true as const, publicId: qr.publicId };
}

export async function regenerateQr(businessId: string, actorId: string, qrId: string) {
  const access = await getBusinessAccess(businessId);
  if (!access.allowed) return { ok: false as const, error: access.reason };
  const current = await prisma.qrCode.findFirst({
    where: { id: qrId, deletedAt: null, place: { businessId, deletedAt: null } },
  });
  if (!current) return { ok: false as const, error: "That QR code was not found." };
  const created = await prisma.qrCode.create({
    data: {
      placeId: current.placeId,
      publicId: await uniquePublicId(),
      label: current.label ? `${current.label} reprint` : "Reprint",
      fgColor: current.fgColor,
      bgColor: current.bgColor,
      includeLogo: current.includeLogo,
    },
  });
  await audit(actorId, "qr.regenerate", "QrCode", created.id, { previousId: current.id });
  return { ok: true as const, qr: created };
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  const taken = await prisma.business.findUnique({ where: { slug: base } });
  if (!taken) return base;
  return `${base}-${Date.now().toString(36)}`.slice(0, 60);
}

async function uniquePublicId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const value = publicId();
    const existing = await prisma.qrCode.findUnique({ where: { publicId: value } });
    if (!existing) return value;
  }
  throw new Error("Could not allocate a QR id.");
}

function blank(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
