import { describe, expect, it } from "vitest";
import { catalog } from "../../../prisma/catalog";
import { composeReview } from "@/services/reviews/generate";
import { BANDS, LANGUAGES, LENGTHS, TONES } from "@/services/reviews/patterns";
import { buildUniqueCorpus, splitSentences } from "@/services/reviews/unique-corpus";

const rows = buildUniqueCorpus();

function key(sentence: string) {
  return sentence.toLowerCase().replace(/[.!?।]+$/g, "").replace(/\s+/g, " ").trim();
}

describe("unique review corpus", () => {
  it("covers every bucket with eight templates and no repeated sentence", () => {
    expect(rows).toHaveLength(13 * LANGUAGES.length * TONES.length * LENGTHS.length * BANDS.length * 8);
    const seen = new Map<string, number>();
    for (const row of rows) {
      expect(row.content.includes("{business}")).toBe(true);
      expect(row.content.includes("{attributes}")).toBe(true);
      expect(row.content.length).toBeGreaterThan(20);
      expect(row.content.length).toBeLessThanOrEqual(1200);
      const sentences = splitSentences(row.content);
      const expected = row.length === "short" ? 3 : row.length === "medium" ? 5 : 7;
      expect(sentences).toHaveLength(expected);
      const businessSentences = sentences.filter((sentence) => sentence.includes("{business}"));
      const attributeSentences = sentences.filter((sentence) => sentence.includes("{attributes}"));
      expect(businessSentences).toHaveLength(1);
      expect(attributeSentences).toHaveLength(1);
      for (const sentence of sentences) {
        const id = `${row.language}\n${key(sentence)}`;
        seen.set(id, (seen.get(id) ?? 0) + 1);
      }
    }
    const repeated = [...seen.entries()].filter(([, count]) => count > 1);
    expect(repeated).toEqual([]);
  });

  it("does not smuggle unselected attribute labels into the stock lines", () => {
    const labels = [...new Set(catalog.flatMap((category) =>
      category.attributes.flatMap((attribute) => [attribute.label, attribute.labelHi, attribute.labelHinglish].map((label) => label.toLowerCase())),
    ))].filter((label) => label.length >= 3);
    const hits: string[] = [];
    for (const row of rows) {
      const stock = splitSentences(row.content)
        .filter((sentence) => !sentence.includes("{attributes}"))
        .join(" ")
        .toLowerCase();
      for (const label of labels) {
        if (stock.includes(label)) hits.push(`${row.slug}/${row.language}: ${label}`);
        if (hits.length >= 8) break;
      }
      if (hits.length >= 8) break;
    }
    expect(hits).toEqual([]);
  });

  it("drops the attribute sentence and keeps a real review", () => {
    const cafe = rows.find(
      (row) => row.slug === "cafe" && row.language === "en" && row.tone === "natural" && row.length === "short" && row.ratingBand === "high",
    );
    expect(cafe).toBeTruthy();
    const draft = composeReview({
      businessName: "Ak Cafe",
      categoryName: "Cafe",
      rating: 5,
      attributes: [{ key: "coffee-quality", label: "Coffee quality", labelHi: "कॉफी", labelHinglish: "coffee quality" }],
      selectedKeys: [],
      language: "en",
      tone: "natural",
      length: "short",
      templates: [{ id: "cafe-1", ...cafe! }],
      seed: 1,
      city: "Kanpur",
    });
    expect(draft.templateId).toBe("cafe-1");
    expect(draft.text).toContain("Ak Cafe");
    expect(draft.text).not.toContain("{");
    expect(draft.text.toLowerCase()).not.toContain("coffee quality");
    expect(draft.text).not.toContain("working on a laptop");
  });
});
