import { subDays, subMonths } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { bucketScans } from "@/services/analytics/series";

export async function businessStats(businessId: string) {
  const placeWhere = { businessId, deletedAt: null };
  const [places, qrCodes, scans, drafts, copies, googleClicks, uniqueVisitors] = await Promise.all([
    prisma.place.count({ where: placeWhere }),
    prisma.qrCode.count({ where: { deletedAt: null, place: placeWhere } }),
    prisma.qrScan.count({ where: { qrCode: { place: placeWhere } } }),
    prisma.reviewGeneration.count({ where: { place: placeWhere } }),
    prisma.reviewEvent.count({ where: { type: "COPY", qrCode: { place: placeWhere } } }),
    prisma.reviewEvent.count({ where: { type: "GOOGLE_CLICK", qrCode: { place: placeWhere } } }),
    prisma.qrScan.findMany({
      where: { visitorKey: { not: null }, qrCode: { place: placeWhere } },
      select: { visitorKey: true },
      distinct: ["visitorKey"],
    }),
  ]);
  return {
    places,
    qrCodes,
    scans,
    drafts,
    copies,
    googleClicks,
    uniqueVisitors: uniqueVisitors.length,
  };
}

export async function scanCharts(businessId: string, now = new Date()) {
  const rows = await prisma.qrScan.findMany({
    where: { createdAt: { gte: subMonths(now, 6) }, qrCode: { place: { businessId, deletedAt: null } } },
    select: { createdAt: true, qrCodeId: true, qrCode: { select: { label: true, place: { select: { name: true, id: true } } } } },
  });
  const dates = rows.map((row) => row.createdAt);
  const daily = bucketScans(dates, subDays(now, 13), now, "day");
  const weekly = bucketScans(dates, subDays(now, 55), now, "week");
  const monthly = bucketScans(dates, subMonths(now, 5), now, "month");

  const byPlace = new Map<string, { label: string; scans: number }>();
  const byQr = new Map<string, { label: string; scans: number }>();
  for (const row of rows) {
    const place = byPlace.get(row.qrCode.place.id) ?? { label: row.qrCode.place.name, scans: 0 };
    place.scans += 1;
    byPlace.set(row.qrCode.place.id, place);
    const qrLabel = `${row.qrCode.place.name} · ${row.qrCode.label || "QR"}`;
    const qr = byQr.get(row.qrCodeId) ?? { label: qrLabel, scans: 0 };
    qr.scans += 1;
    byQr.set(row.qrCodeId, qr);
  }

  return {
    daily,
    weekly,
    monthly,
    byPlace: Array.from(byPlace.values()).sort((a, b) => b.scans - a.scans),
    byQr: Array.from(byQr.values()).sort((a, b) => b.scans - a.scans),
  };
}

export async function platformStats(now = new Date()) {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [
    businesses,
    places,
    qrCodes,
    scans,
    activePaid,
    expired,
    trials,
    revenue,
    newRegistrations,
  ] = await Promise.all([
    prisma.business.count({ where: { deletedAt: null } }),
    prisma.place.count({ where: { deletedAt: null } }),
    prisma.qrCode.count({ where: { deletedAt: null } }),
    prisma.qrScan.count(),
    prisma.subscription.count({ where: { status: "ACTIVE", paymentStatus: "PAID", endDate: { gt: now } } }),
    prisma.subscription.count({ where: { status: "EXPIRED" } }),
    prisma.subscription.count({ where: { status: "TRIAL", trialEnd: { gt: now } } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amountPaise: true } }),
    prisma.business.count({ where: { createdAt: { gte: monthStart }, deletedAt: null } }),
  ]);
  return {
    businesses,
    places,
    qrCodes,
    scans,
    activePaid,
    expired,
    trials,
    revenuePaise: revenue._sum.amountPaise ?? 0,
    newRegistrations,
  };
}

export async function platformCharts(now = new Date()) {
  const scans = await prisma.qrScan.findMany({
    where: { createdAt: { gte: subMonths(now, 6) } },
    select: { createdAt: true },
  });
  const dates = scans.map((scan) => scan.createdAt);
  return {
    daily: bucketScans(dates, subDays(now, 13), now, "day"),
    monthly: bucketScans(dates, subMonths(now, 5), now, "month"),
  };
}
