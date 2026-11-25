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
  city?: string | null;
  avoidText?: string;
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
  const banned = stockSentences(input.avoidText ?? "", input.businessName, values.attributes);
  const attributesSelected = usedLabels.length > 0;
  const pool = input.templates.filter((template) => {
    if (excluded.has(template.id)) return false;
    if (
      template.language !== input.language ||
      template.tone !== input.tone ||
      template.length !== input.length ||
      template.ratingBand !== band
    ) {
      return false;
    }
    const source = reviewSource(template.content, attributesSelected);
    if (!source.includes("{business}")) return false;
    if (attributesSelected && !template.content.includes("{attributes}")) return false;
    return true;
  });

  const ordered = pool.length
    ? rotate(pool, Math.abs(input.seed))
    : [];

  let best: { text: string; templateId: string; overlap: number } | null = null;
  for (const template of ordered) {
    const text = fillPattern(reviewSource(template.content, attributesSelected), values);
    if (!isHonest(text, usedLabels, forbidden, values.attributes)) continue;
    const overlap = stockOverlap(text, banned, input.businessName, values.attributes);
    if (overlap === 0) return finish(text, template.id);
    if (!best || overlap < best.overlap) best = { text, templateId: template.id, overlap };
  }

  const preferred = Math.abs(input.seed) % 2 === 0 ? 0 : 1;
  const variants = [preferred, preferred === 0 ? 1 : 0] as const;
  let fallback = "";
  for (const variant of variants) {
    const text = fillPattern(
      buildPattern({
        language: input.language,
        tone: input.tone,
        length: input.length,
        band: band as RatingBand,
        variant,
      }),
      values,
    );
    if (!fallback) fallback = text;
    if (stockOverlap(text, banned, input.businessName, values.attributes) === 0) {
      return finish(text, null);
    }
  }

  if (best) return finish(best.text, best.templateId);
  return finish(fallback, null);

  function finish(text: string, templateId: string | null): DraftResult {
    return {
      text: withPlaceLocation(
        text,
        input.city,
        input.categoryName,
        input.language,
        input.rating,
        input.seed,
        banned,
        input.avoidText ?? "",
      ),
      templateId,
      usedKeys: selected.map((item) => item.key),
      usedLabels,
    };
  }
}

const GENERIC_CATEGORIES = new Set(["other", "others", "general", "misc", "miscellaneous", "business", "place"]);

function withPlaceLocation(
  text: string,
  city: string | null | undefined,
  categoryName: string,
  language: ReviewLanguage,
  rating: number,
  seed: number,
  banned: Set<string>,
  avoidText: string,
) {
  const cleanCity = (city ?? "").replace(/\s+/g, " ").trim();
  const category = spokenCategory(categoryName, language);
  if (!cleanCity || !category) return text;
  const options = categoryCityLines(language, rating, category, cleanCity);
  const lower = text.toLowerCase();
  if (options.some((line) => lower.includes(normalizeSentence(line)))) return text;
  const previous = avoidText.toLowerCase();
  const fresh = options.filter((line) => {
    const spoken = normalizeSentence(line);
    return !banned.has(spoken) && !previous.includes(spoken);
  });
  const pool = fresh.length ? fresh : options;
  const line = pool[Math.abs(seed) % pool.length];
  return `${text} ${line}`.replace(/\s+/g, " ").trim();
}

function spokenCategory(categoryName: string, language: ReviewLanguage) {
  const category = categoryName.replace(/\s+/g, " ").trim().toLowerCase();
  if (!category || !GENERIC_CATEGORIES.has(category)) return category;
  if (language === "hi") return "जगह";
  return "place";
}

function categoryCityLines(language: ReviewLanguage, rating: number, category: string, city: string) {
  const a = article(category);
  const A = capitalize(a);
  if (language === "hi") {
    if (rating >= 4) {
      return [
        `${city} में ${category} का अनुभव अच्छा रहा।`,
        `${city} में इस ${category} पर दोबारा जाना चाहूँगा।`,
        `${city} में ${category} का समय अच्छा बीता।`,
        `${city} में यह ${category} सुझाव के लायक है।`,
        `${city} में ${category} पसंद आया।`,
      ];
    }
    if (rating === 3) {
      return [
        `${city} में ${category} का अनुभव औसत रहा।`,
        `${city} में ${category} ठीक-ठाक रहा।`,
        `${city} में यह ${category} न अच्छा न बुरा।`,
        `${city} में ${category} का समय साधारण रहा।`,
        `${city} में ${category} औसत ही रहा।`,
      ];
    }
    return [
      `${city} में ${category} का अनुभव अच्छा नहीं रहा।`,
      `${city} में इस ${category} पर दोबारा नहीं जाना चाहूँगा।`,
      `${city} में ${category} निराश कर गया।`,
      `${city} में यह ${category} सुझाव के लायक नहीं है।`,
      `${city} में ${category} कमज़ोर रहा।`,
    ];
  }
  if (language === "hinglish") {
    if (rating >= 4) {
      return [
        `${city} mein ${category} ka experience accha raha.`,
        `${city} mein is ${category} par dobara aana chahta hoon.`,
        `${city} mein ${category} ka time accha guzra.`,
        `${city} mein yeh ${category} suggest karunga.`,
        `${city} ka yeh ${category} pasand aaya.`,
      ];
    }
    if (rating === 3) {
      return [
        `${city} mein ${category} ka experience average raha.`,
        `${city} mein ${category} theek-thaak raha.`,
        `${city} mein yeh ${category} na accha na bura.`,
        `${city} mein ${category} ka time sadharan raha.`,
        `${city} mein ${category} average hi raha.`,
      ];
    }
    return [
      `${city} mein ${category} ka experience accha nahi raha.`,
      `${city} mein is ${category} par dobara nahi aana chahta.`,
      `${city} mein ${category} nirash kar gaya.`,
      `${city} mein yeh ${category} suggest nahi karunga.`,
      `${city} mein ${category} weak raha.`,
    ];
  }
  if (rating >= 4) {
    return [
      `A good ${category} in ${city}.`,
      `${A} ${category} in ${city} I would visit again.`,
      `Happy with this ${category} in ${city}.`,
      `${A} ${category} in ${city} I would recommend.`,
      `Worth another visit to this ${category} in ${city}.`,
    ];
  }
  if (rating === 3) {
    return [
      `An average ${category} in ${city}.`,
      `An okay ${category} in ${city}.`,
      `A middling ${category} in ${city}.`,
      `This ${category} in ${city} was just fine.`,
      `Not bad for ${a} ${category} in ${city}, not great either.`,
    ];
  }
  return [
    `Not the ${category} I would pick in ${city}.`,
    `I would skip this ${category} in ${city}.`,
    `Not ${a} ${category} I would recommend in ${city}.`,
    `A disappointing ${category} in ${city}.`,
    `I expected more from this ${category} in ${city}.`,
  ];
}

function article(word: string) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function capitalize(word: string) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : word;
}

function stockSentences(text: string, businessName: string, attributePhrase: string) {
  const banned = new Set<string>();
  for (const sentence of splitSentences(text)) {
    if (!isStockSentence(sentence, businessName, attributePhrase)) continue;
    banned.add(normalizeSentence(sentence));
  }
  return banned;
}

function stockOverlap(text: string, banned: Set<string>, businessName: string, attributePhrase: string) {
  if (banned.size === 0) return 0;
  let overlap = 0;
  for (const sentence of splitSentences(text)) {
    if (!isStockSentence(sentence, businessName, attributePhrase)) continue;
    if (banned.has(normalizeSentence(sentence))) overlap += 1;
  }
  return overlap;
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeSentence(sentence: string) {
  return sentence
    .toLowerCase()
    .replace(/[.!?।]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isStockSentence(sentence: string, businessName: string, attributePhrase: string) {
  if (mentions(sentence, businessName)) return false;
  if (mentions(sentence, attributePhrase)) return false;
  return normalizeSentence(sentence).length >= 8;
}

function mentions(text: string, phrase: string) {
  const needle = phrase.trim().toLowerCase();
  if (needle.length < 2) return false;
  const hay = text.toLowerCase();
  let from = 0;
  while (from <= hay.length - needle.length) {
    const at = hay.indexOf(needle, from);
    if (at < 0) return false;
    const before = at === 0 || /[^\p{L}\p{N}]/u.test(hay[at - 1] ?? "");
    const afterAt = at + needle.length;
    const after = afterAt >= hay.length || /[^\p{L}\p{N}]/u.test(hay[afterAt] ?? "");
    if (before && after) return true;
    from = at + 1;
  }
  return false;
}

function reviewSource(content: string, attributesSelected: boolean) {
  if (attributesSelected) return content;
  return content
    .split(/(?<=[.!?।])\s+/)
    .filter((sentence) => !sentence.includes("{attributes}"))
    .join(" ")
    .trim();
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
  if (usedLabels.length > 0 && attributePhrase) {
    const remainder = text.split(attributePhrase).join(" ").toLowerCase();
    for (const label of forbidden) {
      if (label && remainder.includes(label.toLowerCase())) return false;
    }
  }
  if (text.includes("{")) return false;
  return text.length > 0 && text.length <= 1200;
}
