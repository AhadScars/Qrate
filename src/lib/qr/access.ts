import { readAuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function loadQrForActor(id: string) {
  const auth = await readAuthUser();
  if (!auth) return null;
  if (auth.user.role === "SUPER_ADMIN") {
    return prisma.qrCode.findFirst({
      where: { id, deletedAt: null },
      include: { place: { include: { business: true } } },
    });
  }
  const businessId = auth.membership?.businessId;
  if (!businessId) return null;
  return prisma.qrCode.findFirst({
    where: { id, deletedAt: null, place: { businessId, deletedAt: null } },
    include: { place: { include: { business: true } } },
  });
}
