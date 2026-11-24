import { prisma } from "@/lib/db/prisma";

export function ownerPlaces(businessId: string, query?: string) {
  return prisma.place.findMany({
    where: {
      businessId,
      deletedAt: null,
      ...(query
        ? { OR: [{ name: { contains: query } }, { city: { contains: query } }, { address: { contains: query } }] }
        : {}),
    },
    include: { category: true, qrCodes: { where: { deletedAt: null } } },
    orderBy: { createdAt: "desc" },
  });
}

export function ownerPlace(businessId: string, placeId: string) {
  return prisma.place.findFirst({
    where: { id: placeId, businessId, deletedAt: null },
    include: { category: true, qrCodes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } } },
  });
}

export function activeCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    include: { attributes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: { name: "asc" },
  });
}

export function ownerQrCodes(businessId: string) {
  return prisma.qrCode.findMany({
    where: { deletedAt: null, place: { businessId, deletedAt: null } },
    include: {
      place: true,
      _count: { select: { scans: true, generations: true, events: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function ownerQr(businessId: string, qrId: string) {
  return prisma.qrCode.findFirst({
    where: { id: qrId, deletedAt: null, place: { businessId, deletedAt: null } },
    include: { place: { include: { business: true } } },
  });
}

export function ownerReviews(businessId: string) {
  return prisma.reviewGeneration.findMany({
    where: { place: { businessId, deletedAt: null } },
    include: { place: true, qrCode: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function ownerPayments(businessId: string) {
  return prisma.payment.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export function ownerSubscription(businessId: string) {
  return prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export function recentAuditsForActor(actorId: string) {
  return prisma.auditLog.findMany({
    where: { actorId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export async function adminBusinesses(query?: string, status?: string) {
  return prisma.business.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(query
        ? { OR: [{ name: { contains: query } }, { email: { contains: query } }, { slug: { contains: query } }] }
        : {}),
    },
    include: {
      owner: true,
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { places: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export function adminBusiness(id: string) {
  return prisma.business.findUnique({
    where: { id },
    include: {
      owner: true,
      places: { where: { deletedAt: null }, include: { category: true, qrCodes: true } },
      subscriptions: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
      trials: { orderBy: { createdAt: "desc" } },
    },
  });
}

export function adminCustomers() {
  return prisma.business.findMany({
    where: { deletedAt: null },
    include: {
      places: {
        where: { deletedAt: null },
        include: {
          category: true,
          qrCodes: {
            where: { deletedAt: null },
            include: { _count: { select: { scans: true } } },
          },
        },
      },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function adminQrCodes() {
  return prisma.qrCode.findMany({
    where: { deletedAt: null, place: { deletedAt: null } },
    include: {
      place: { include: { business: true, category: true } },
      _count: { select: { scans: true, generations: true, events: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export function adminPlaces(query?: string) {
  return prisma.place.findMany({
    where: {
      deletedAt: null,
      ...(query ? { OR: [{ name: { contains: query } }, { city: { contains: query } }] } : {}),
    },
    include: { business: true, category: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  });
}

const categoryInclude = {
  attributes: { orderBy: { sortOrder: "asc" as const } },
  _count: { select: { places: true, templates: true } },
};

export function adminCategories() {
  return prisma.category.findMany({
    include: categoryInclude,
    orderBy: { name: "asc" },
  });
}

export function categoryCount() {
  return prisma.category.count();
}

export function adminCategoryPage(page: number, pageSize: number) {
  return prisma.category.findMany({
    include: categoryInclude,
    orderBy: { name: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export function adminSubscriptions() {
  return prisma.subscription.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  });
}

export function adminPayments() {
  return prisma.payment.findMany({
    include: { business: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  });
}

export function adminTrials() {
  return prisma.trial.findMany({
    include: { business: { include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    orderBy: { endDate: "asc" },
    take: 150,
  });
}

export function templateWhere(filters: { categoryId?: string; language?: string; q?: string }) {
  return {
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.language ? { language: filters.language } : {}),
    ...(filters.q ? { content: { contains: filters.q } } : {}),
  };
}

export function adminTemplates(filters: { categoryId?: string; language?: string; q?: string }, page: number, pageSize: number) {
  return prisma.reviewTemplate.findMany({
    where: templateWhere(filters),
    include: { category: true },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export function templateCount(filters?: { categoryId?: string; language?: string; q?: string }) {
  return prisma.reviewTemplate.count({ where: filters ? templateWhere(filters) : undefined });
}

export function recentAudits() {
  return prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
}
