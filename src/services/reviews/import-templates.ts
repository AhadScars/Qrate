import { parseCsv } from "@/lib/csv";
import { BANDS, LANGUAGES, LENGTHS, TONES } from "@/services/reviews/patterns";

const HEADER = ["categorySlug", "language", "tone", "length", "ratingBand", "content", "isActive"] as const;

export type TemplateImportRow = {
  categoryId: string;
  language: string;
  tone: string;
  length: string;
  ratingBand: string;
  content: string;
  isActive: boolean;
};

export function parseTemplateCsv(csv: string, categories: { id: string; slug: string }[]) {
  const table = parseCsv(csv);
  const [header, ...body] = table;
  if (!header || header.every((cell) => cell === "")) {
    return { ok: false as const, error: "The CSV is empty." };
  }
  if (HEADER.some((column, index) => header[index] !== column)) {
    return { ok: false as const, error: `Header must be ${HEADER.join(",")}` };
  }
  const bySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const rows: TemplateImportRow[] = [];
  for (const [index, cells] of body.entries()) {
    const line = index + 2;
    const [categorySlug, language, tone, length, ratingBand, content, isActive] = cells;
    const categoryId = bySlug.get(categorySlug || "");
    if (!categoryId) return { ok: false as const, error: `Row ${line}: unknown category slug ${categorySlug || "(blank)"}.` };
    if (!LANGUAGES.includes(language as (typeof LANGUAGES)[number])) {
      return { ok: false as const, error: `Row ${line}: bad language ${language}. Use en, hi, or hinglish.` };
    }
    if (!TONES.includes(tone as (typeof TONES)[number])) {
      return { ok: false as const, error: `Row ${line}: bad tone ${tone}.` };
    }
    if (!LENGTHS.includes(length as (typeof LENGTHS)[number])) {
      return { ok: false as const, error: `Row ${line}: bad length ${length}.` };
    }
    if (!BANDS.includes(ratingBand as (typeof BANDS)[number])) {
      return { ok: false as const, error: `Row ${line}: bad rating band ${ratingBand}.` };
    }
    if (!content?.includes("{business}") || !content.includes("{attributes}")) {
      return { ok: false as const, error: `Row ${line} needs {business} and {attributes}.` };
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
  if (rows.length < 1) return { ok: false as const, error: "The file has no template rows." };
  return { ok: true as const, rows };
}
