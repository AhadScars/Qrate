import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { createOwnerAccount } from "@/services/accounts/service";
import { createPlace, updatePlace } from "@/services/places/service";
import { getBusinessAccess } from "@/services/subscriptions/service";
import { composeReview } from "@/services/reviews/generate";

const stamp = Date.now().toString(36);

describe("tenant isolation and trial", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("keeps one business from editing another location and expires a past trial", async () => {
    const first = await createOwnerAccount({
      name: "A Owner",
      email: `a-${stamp}@qrate.test`,
      password: "password123",
      businessName: `Alpha ${stamp}`,
    });
    const second = await createOwnerAccount({
      name: "B Owner",
      email: `b-${stamp}@qrate.test`,
      password: "password123",
      businessName: `Beta ${stamp}`,
    });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;

    const category = await prisma.category.create({
      data: { name: `Cafe ${stamp}`, slug: `cafe-${stamp}`, welcomeMessage: "How was the coffee?" },
    });
    await prisma.categoryAttribute.create({
      data: {
        categoryId: category.id,
        key: "coffee-quality",
        label: "Coffee quality",
        labelHi: "कॉफी",
        labelHinglish: "coffee quality",
      },
    });

    const place = await createPlace({
      businessId: first.businessId,
      actorId: first.userId,
      name: "Alpha Counter",
      categoryId: category.id,
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=test",
    });
    expect(place.ok).toBe(true);
    if (!place.ok) return;
    expect(place.place.qrCodes[0]?.publicId).toHaveLength(10);

    const leaked = await updatePlace({
      businessId: second.businessId,
      actorId: second.userId,
      placeId: place.place.id,
      name: "Stolen",
      categoryId: category.id,
    });
    expect(leaked.ok).toBe(false);

    const access = await getBusinessAccess(first.businessId, new Date());
    expect(access.allowed).toBe(true);
    expect(access.state).toBe("TRIAL");

    await prisma.subscription.updateMany({
      where: { businessId: first.businessId, status: "TRIAL" },
      data: { trialEnd: new Date("2020-01-01T00:00:00.000Z") },
    });
    await prisma.trial.updateMany({
      where: { businessId: first.businessId },
      data: { endDate: new Date("2020-01-01T00:00:00.000Z") },
    });
    const expired = await getBusinessAccess(first.businessId, new Date("2026-11-23T00:00:00.000Z"));
    expect(expired.allowed).toBe(false);
    expect(expired.state).toBe("EXPIRED");

    const draft = composeReview({
      businessName: "Alpha Counter",
      categoryName: "Cafe",
      rating: 4,
      attributes: [{ key: "coffee-quality", label: "Coffee quality", labelHi: "कॉफी", labelHinglish: "coffee quality" }],
      selectedKeys: ["coffee-quality"],
      language: "en",
      tone: "natural",
      length: "short",
      templates: [],
      seed: 3,
    });
    expect(draft.text).toContain("Coffee quality");
    expect(draft.text).toContain("Alpha Counter");
  });
});
