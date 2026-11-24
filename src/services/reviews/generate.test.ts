import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/csv";
import { safeJoin } from "@/lib/security/paths";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { bucketScans } from "@/services/analytics/series";
import { composeReview } from "@/services/reviews/generate";
import { parseTemplateCsv } from "@/services/reviews/import-templates";
import { canImportTemplates } from "@/services/reviews/patterns";
import { evaluateAccess } from "@/services/subscriptions/access";

const attributes = [
  { key: "food-quality", label: "Food quality", labelHi: "खाने की क्वालिटी", labelHinglish: "food quality" },
  { key: "pricing", label: "Pricing", labelHi: "कीमत", labelHinglish: "pricing" },
  { key: "cleanliness", label: "Cleanliness", labelHi: "सफाई", labelHinglish: "safai" },
];

describe("review drafts", () => {
  it("mentions only the topics the customer selected", () => {
    const draft = composeReview({
      businessName: "Copper Pot",
      categoryName: "Restaurant",
      rating: 5,
      attributes,
      selectedKeys: ["food-quality", "cleanliness"],
      language: "en",
      tone: "natural",
      length: "medium",
      templates: [
        {
          id: "bad",
          language: "en",
          tone: "natural",
          length: "medium",
          ratingBand: "high",
          content: "The pricing was wonderful at {business}. I give {rating}. {attributes}",
        },
        {
          id: "good",
          language: "en",
          tone: "natural",
          length: "medium",
          ratingBand: "high",
          content: "I visited {business}. I give it {rating} out of 5. It felt {rating_phrase}. I am only talking about {attributes}.",
        },
      ],
      seed: 1,
    });
    expect(draft.text.toLowerCase()).toContain("food quality");
    expect(draft.text.toLowerCase()).toContain("cleanliness");
    expect(draft.text.toLowerCase()).not.toContain("pricing");
    expect(draft.templateId).toBe("good");
  });

  it("does not invent a topic when nothing was selected", () => {
    const draft = composeReview({
      businessName: "Copper Pot",
      categoryName: "Restaurant",
      rating: 2,
      attributes,
      selectedKeys: [],
      language: "hinglish",
      tone: "simple",
      length: "short",
      templates: [],
      seed: 2,
    });
    expect(draft.text.toLowerCase()).not.toContain("food quality");
    expect(draft.text.toLowerCase()).not.toContain("pricing");
    expect(draft.text).toContain("2");
    expect(draft.text).toContain("Copper Pot");
  });

  it("changes pattern when the previous template is excluded", () => {
    const templates = [0, 1].map((index) => ({
      id: `t${index}`,
      language: "en",
      tone: "friendly" as const,
      length: "short" as const,
      ratingBand: "low",
      content:
        index === 0
          ? "I stopped by {business}. I give it {rating} out of 5. I was not satisfied. It felt {rating_phrase}. I am only talking about {attributes}."
          : "Here is my honest note about {business}. I give it {rating} out of 5. I was not satisfied. It felt {rating_phrase}. I am only talking about {attributes}.",
    }));
    const first = composeReview({
      businessName: "North Gym",
      categoryName: "Gym",
      rating: 1,
      attributes,
      selectedKeys: ["pricing"],
      language: "en",
      tone: "friendly",
      length: "short",
      templates,
      seed: 0,
    });
    const second = composeReview({
      businessName: "North Gym",
      categoryName: "Gym",
      rating: 1,
      attributes,
      selectedKeys: ["pricing"],
      language: "en",
      tone: "friendly",
      length: "short",
      templates,
      seed: 0,
      excludeTemplateIds: first.templateId ? [first.templateId] : [],
    });
    expect(second.templateId).not.toBe(first.templateId);
    expect(second.text.toLowerCase()).toContain("pricing");
  });

  it("uses a saved review that has no rating token and drops the attribute sentence", () => {
    const draft = composeReview({
      businessName: "Abdul Ahad Enterprises",
      categoryName: "Restaurant",
      rating: 3,
      attributes,
      selectedKeys: [],
      language: "en",
      tone: "natural",
      length: "short",
      templates: [
        {
          id: "saved",
          language: "en",
          tone: "natural",
          length: "short",
          ratingBand: "mid",
          content:
            "{business} was okay, a mix of good and not so good. The {attributes} were okay, nothing special. Decent option for a good lunch.",
        },
      ],
      seed: 1,
    });
    expect(draft.templateId).toBe("saved");
    expect(draft.text).toContain("Abdul Ahad Enterprises");
    expect(draft.text).toContain("Decent option for a good lunch.");
    expect(draft.text).not.toContain("{");
    expect(draft.text.toLowerCase()).not.toContain("overall visit");
    expect(draft.text.toLowerCase()).not.toContain("food quality");
  });
});

describe("subscription access", () => {
  const now = new Date("2026-11-23T00:00:00.000Z");

  it("allows an open trial and refuses an ended one", () => {
    const open = evaluateAccess({
      now,
      businessStatus: "ACTIVE",
      trial: { endDate: new Date("2026-11-25T00:00:00.000Z"), isDisabled: false },
      subscription: { status: "TRIAL", endDate: null, trialEnd: new Date("2026-11-25T00:00:00.000Z"), paymentStatus: "UNPAID" },
    });
    const ended = evaluateAccess({
      now,
      businessStatus: "ACTIVE",
      trial: { endDate: new Date("2026-11-20T00:00:00.000Z"), isDisabled: false },
      subscription: { status: "TRIAL", endDate: null, trialEnd: new Date("2026-11-20T00:00:00.000Z"), paymentStatus: "UNPAID" },
    });
    expect(open.allowed).toBe(true);
    expect(ended.allowed).toBe(false);
    expect(ended.state).toBe("EXPIRED");
  });

  it("does not treat an unpaid or expired plan as active", () => {
    const unpaid = evaluateAccess({
      now,
      businessStatus: "ACTIVE",
      trial: null,
      subscription: { status: "ACTIVE", endDate: new Date("2030-01-01T00:00:00.000Z"), trialEnd: null, paymentStatus: "UNPAID" },
    });
    const expired = evaluateAccess({
      now,
      businessStatus: "ACTIVE",
      trial: null,
      subscription: { status: "ACTIVE", endDate: new Date("2026-11-01T00:00:00.000Z"), trialEnd: null, paymentStatus: "PAID" },
    });
    const paid = evaluateAccess({
      now,
      businessStatus: "ACTIVE",
      trial: null,
      subscription: { status: "ACTIVE", endDate: new Date("2030-01-01T00:00:00.000Z"), trialEnd: null, paymentStatus: "PAID" },
    });
    expect(unpaid.allowed).toBe(false);
    expect(expired.allowed).toBe(false);
    expect(paid.allowed).toBe(true);
  });

  it("blocks suspended, cancelled, and disabled trials", () => {
    expect(
      evaluateAccess({
        now,
        businessStatus: "SUSPENDED",
        trial: { endDate: new Date("2026-11-30T00:00:00.000Z"), isDisabled: false },
        subscription: { status: "TRIAL", endDate: null, trialEnd: new Date("2026-11-30T00:00:00.000Z"), paymentStatus: "UNPAID" },
      }).allowed,
    ).toBe(false);
    expect(
      evaluateAccess({
        now,
        businessStatus: "ACTIVE",
        trial: null,
        subscription: { status: "CANCELLED", endDate: new Date("2030-01-01T00:00:00.000Z"), trialEnd: null, paymentStatus: "PAID" },
      }).state,
    ).toBe("CANCELLED");
    expect(
      evaluateAccess({
        now,
        businessStatus: "ACTIVE",
        trial: { endDate: new Date("2026-11-30T00:00:00.000Z"), isDisabled: true },
        subscription: { status: "TRIAL", endDate: null, trialEnd: new Date("2026-11-30T00:00:00.000Z"), paymentStatus: "UNPAID" },
      }).allowed,
    ).toBe(false);
  });
});

describe("guards and helpers", () => {
  it("caps template imports at 20000", () => {
    expect(canImportTemplates(19990, 20).ok).toBe(false);
    expect(canImportTemplates(0, 11232).ok).toBe(true);
    expect(canImportTemplates(10, 20).ok).toBe(true);
  });

  it("reads a template csv row with commas inside the review", () => {
    const csv = [
      "categorySlug,language,tone,length,ratingBand,content,isActive",
      'restaurant,en,natural,short,mid,"{business} was okay, a mix of good and not so good. The {attributes} were okay.",true',
    ].join("\n");
    const parsed = parseTemplateCsv(csv, [{ id: "cat-restaurant", slug: "restaurant" }]);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]?.categoryId).toBe("cat-restaurant");
    expect(parsed.rows[0]?.content).toContain("{business}");
    expect(parsed.rows[0]?.isActive).toBe(true);
  });

  it("buckets scans without dropping empty days", () => {
    const points = bucketScans(
      [new Date("2026-11-22T10:00:00.000Z"), new Date("2026-11-22T12:00:00.000Z")],
      new Date("2026-11-21T00:00:00.000Z"),
      new Date("2026-11-23T00:00:00.000Z"),
      "day",
    );
    expect(points).toHaveLength(3);
    expect(points.reduce((sum, point) => sum + point.scans, 0)).toBe(2);
  });

  it("rejects paths that leave the storage root", () => {
    expect(() => safeJoin("/tmp/qrate-storage", "..", "etc", "passwd")).toThrow("Invalid path");
    expect(safeJoin("/tmp/qrate-storage", "biz", "logo.png")).toContain("logo.png");
  });

  it("parses quoted csv cells", () => {
    const rows = parseCsv('categorySlug,content\ncafe,"Hello {business}, ""hi"" {attributes}"');
    expect(rows[1][1]).toBe('Hello {business}, "hi" {attributes}');
  });

  it("hashes passwords", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).not.toContain("correct horse");
    expect(await verifyPassword("correct horse", hash)).toBe(true);
    expect(await verifyPassword("wrong horse", hash)).toBe(false);
  });
});
