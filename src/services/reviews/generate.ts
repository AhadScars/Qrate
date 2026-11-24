import {
  attributeLabel,
  buildPattern,
  fillPattern,
  joinLabels,
  ratingBand,
  ratingPhrase,
  type RatingBand,
  type ReviewLanguage,
  type ReviewLength,
  type ReviewTone,
} from "@/services/reviews/patterns";

export type DraftTemplate = {
  id: string;
  content: string;
  language: string;
  tone: string;
  length: string;
  ratingBand: string;
};

export type DraftAttribute = {
  key: string;
  label: string;
  labelHi: string;
  labelHinglish: string;
};

export type DraftInput = {
  businessName: string;
  categoryName: string;
  rating: number;
  attributes: DraftAttribute[];
  selectedKeys: string[];
  language: ReviewLanguage;
  tone: ReviewTone;
  length: ReviewLength;
  templates: DraftTemplate[];
  seed: number;
  excludeTemplateIds?: string[];
};

export type DraftResult = {
  text: string;
  templateId: string | null;
  usedKeys: string[];
  usedLabels: string[];
};

export function composeReview(input: DraftInput): DraftResult {
  const selected = input.attributes.filter((attribute) => input.selectedKeys.includes(attribute.key));
  const usedLabels = selected.map((attribute) => attributeLabel(attribute, input.language));
  const forbidden = input.attributes
    .filter((attribute) => !input.selectedKeys.includes(attribute.key))
    .flatMap((attribute) => [attribute.label, attribute.labelHi, attribute.labelHinglish])
    .filter(Boolean);

  const band = ratingBand(input.rating);
  const values = {
    business: input.businessName,
    category: input.categoryName,
    rating: String(input.rating),
    rating_phrase: ratingPhrase(input.language, input.rating),
    attributes: joinLabels(usedLabels, input.language),
  };

  const excluded = new Set(input.excludeTemplateIds ?? []);
  const pool = input.templates.filter((template) => {
    if (!template.content.includes("{business}") || !template.content.includes("{rating}")) return false;
    if (usedLabels.length > 0 && !template.content.includes("{attributes}")) return false;
    if (excluded.has(template.id)) return false;
    return (
      template.language === input.language &&
      template.tone === input.tone &&
      template.length === input.length &&
      template.ratingBand === band
    );
  });

  const ordered = pool.length
    ? rotate(pool, Math.abs(input.seed))
    : [];

  for (const template of ordered) {
    const text = fillPattern(template.content, values);
    if (isHonest(text, usedLabels, forbidden, values.attributes)) {
      return { text, templateId: template.id, usedKeys: selected.map((item) => item.key), usedLabels };
    }
  }

  const fallback = fillPattern(
    buildPattern({
      language: input.language,
      tone: input.tone,
      length: input.length,
      band: band as RatingBand,
      variant: Math.abs(input.seed) % 2 === 0 ? 0 : 1,
    }),
    values,
  );

  return {
    text: fallback,
    templateId: null,
    usedKeys: selected.map((item) => item.key),
    usedLabels,
  };
}

function rotate<T>(items: T[], seed: number) {
  if (items.length === 0) return items;
  const start = seed % items.length;
  return items.slice(start).concat(items.slice(0, start));
}

function isHonest(text: string, usedLabels: string[], forbidden: string[], attributePhrase: string) {
  const lower = text.toLowerCase();
  for (const label of usedLabels) {
    if (!lower.includes(label.toLowerCase())) return false;
  }
  const remainder = text.split(attributePhrase).join(" ").toLowerCase();
  for (const label of forbidden) {
    if (label && remainder.includes(label.toLowerCase())) return false;
  }
  if (text.includes("{")) return false;
  return text.length > 0 && text.length <= 1200;
}
