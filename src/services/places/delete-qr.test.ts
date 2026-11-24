import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { deleteIssuedQr } from "@/services/places/service";

const stamp = `del-${Date.now().toString(36)}`;

describe("delete issued QR", () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: `${stamp}@qrate.test` } });
    await prisma.category.deleteMany({ where: { slug: stamp } });
    await prisma.$disconnect();
  });

  it("removes the QR, its scans, the place, and the customer", async () => {
    const user = await prisma.user.create({
      data: { name: "Delete tester", email: `${stamp}@qrate.test`, passwordHash: "x", role: "OWNER" },
    });
    const category = await prisma.category.create({ data: { name: stamp, slug: stamp } });
    const business = await prisma.business.create({
      data: { ownerId: user.id, name: `Shop ${stamp}`, slug: stamp, status: "ACTIVE" },
    });
    const place = await prisma.place.create({
      data: { businessId: business.id, categoryId: category.id, name: `Counter ${stamp}` },
    });
    const qr = await prisma.qrCode.create({
      data: { placeId: place.id, publicId: stamp.slice(0, 10).toUpperCase() },
    });
    await prisma.qrScan.create({ data: { qrCodeId: qr.id } });
    await prisma.subscription.create({
      data: { businessId: business.id, planName: "Admin plan", amountPaise: 0, status: "ACTIVE", paymentStatus: "PAID" },
    });

    const deleted = await deleteIssuedQr(user.id, qr.id);
    expect(deleted.ok).toBe(true);
    expect(await prisma.qrCode.findUnique({ where: { id: qr.id } })).toBeNull();
    expect(await prisma.qrScan.count({ where: { qrCodeId: qr.id } })).toBe(0);
    expect(await prisma.place.findUnique({ where: { id: place.id } })).toBeNull();
    expect(await prisma.business.findUnique({ where: { id: business.id } })).toBeNull();
    expect(await prisma.user.findUnique({ where: { id: user.id } })).not.toBeNull();
  });
});
