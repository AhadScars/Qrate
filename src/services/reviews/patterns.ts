export const LANGUAGES = ["en", "hi", "hinglish"] as const;
export const TONES = ["natural", "professional", "friendly", "simple"] as const;
export const LENGTHS = ["short", "medium", "detailed"] as const;
export const BANDS = ["high", "mid", "low"] as const;

export type ReviewLanguage = (typeof LANGUAGES)[number];
export type ReviewTone = (typeof TONES)[number];
export type ReviewLength = (typeof LENGTHS)[number];
export type RatingBand = (typeof BANDS)[number];

const openings: Record<ReviewLanguage, Record<ReviewTone, [string, string]>> = {
  en: {
    natural: ["I visited {business}.", "This note is from my visit to {business}."],
    professional: ["I am sharing feedback for {business}.", "My feedback for {business} follows."],
    friendly: ["I stopped by {business}.", "Here is my honest note about {business}."],
    simple: ["I went to {business}.", "I want to review {business}."],
  },
  hi: {
    natural: ["यह मेरी समीक्षा {business} के लिए है।", "मैं {business} के बारे में अपनी बात लिख रहा हूँ।"],
    professional: ["मैं {business} के लिए अपनी प्रतिक्रिया दे रहा हूँ।", "यह {business} पर मेरी दी हुई प्रतिक्रिया है।"],
    friendly: ["मैं {business} गया और अपनी बात सीधे लिख रहा हूँ।", "{business} के बारे में मेरी साफ राय यह है।"],
    simple: ["मैं {business} गया।", "मैं {business} की समीक्षा लिख रहा हूँ।"],
  },
  hinglish: {
    natural: ["Maine {business} visit kiya.", "Yeh meri review {business} ke liye hai."],
    professional: ["Main {business} ke liye apna feedback de raha hoon.", "Yeh {business} par mera feedback hai."],
    friendly: ["Main {business} gaya aur seedhi baat likh raha hoon.", "{business} ke baare mein meri saaf rai yeh hai."],
    simple: ["Main {business} gaya.", "Main {business} ki review likh raha hoon."],
  },
};

const ratingLines: Record<ReviewLanguage, Record<RatingBand, string>> = {
  en: {
    high: "I give it {rating} out of 5. The visit felt {rating_phrase}.",
    mid: "I give it {rating} out of 5. For me it was {rating_phrase}.",
    low: "I give it {rating} out of 5. I was not satisfied. It felt {rating_phrase}.",
  },
  hi: {
    high: "मैं 5 में से {rating} देता हूँ। अनुभव {rating_phrase} रहा।",
    mid: "मैं 5 में से {rating} देता हूँ। मेरे लिए यह {rating_phrase} रहा।",
    low: "मैं 5 में से {rating} देता हूँ। मैं संतुष्ट नहीं हुआ। अनुभव {rating_phrase} रहा।",
  },
  hinglish: {
    high: "Main 5 mein se {rating} de raha hoon. Experience {rating_phrase} raha.",
    mid: "Main 5 mein se {rating} de raha hoon. Mere liye yeh {rating_phrase} raha.",
    low: "Main 5 mein se {rating} de raha hoon. Main satisfied nahi hua. Experience {rating_phrase} raha.",
  },
};

const attributeLines: Record<ReviewLanguage, Record<ReviewLength, string>> = {
  en: {
    short: "I am only talking about {attributes}.",
    medium: "My comments are only about {attributes}.",
    detailed: "Please read this as my own view of {attributes} at this {category}.",
  },
  hi: {
    short: "मैं सिर्फ {attributes} के बारे में लिख रहा हूँ।",
    medium: "मेरी टिप्पणी सिर्फ {attributes} पर है।",
    detailed: "इसे इस {category} पर {attributes} के बारे में मेरी अपनी राय पढ़ें।",
  },
  hinglish: {
    short: "Main sirf {attributes} ke baare mein likh raha hoon.",
    medium: "Meri baat sirf {attributes} par hai.",
    detailed: "Isko is {category} par {attributes} ke baare mein meri apni rai padhein.",
  },
};

const closing: Record<ReviewLanguage, string> = {
  en: "I will check these words and submit the review myself.",
  hi: "मैं इन शब्दों को जाँचकर समीक्षा खुद जमा करूँगा।",
  hinglish: "Main in words ko check karke review khud submit karunga.",
};

export function ratingBand(rating: number): RatingBand {
  if (rating >= 4) return "high";
  if (rating === 3) return "mid";
  return "low";
}

export function ratingPhrase(language: ReviewLanguage, rating: number) {
  const table: Record<ReviewLanguage, Record<number, string>> = {
    en: {
      5: "excellent",
      4: "good",
      3: "average",
      2: "below what I expected",
      1: "poor",
    },
    hi: {
      5: "बहुत अच्छा",
      4: "अच्छा",
      3: "ठीक-ठाक",
      2: "उम्मीद से कम",
      1: "कमज़ोर",
    },
    hinglish: {
      5: "bahut accha",
      4: "accha",
      3: "theek-thaak",
      2: "expectation se kam",
      1: "weak",
    },
  };
  return table[language][rating] ?? table[language][3];
}

export function joinLabels(labels: string[], language: ReviewLanguage) {
  if (labels.length === 0) {
    if (language === "hi") return "सिर्फ पूरे अनुभव";
    if (language === "hinglish") return "sirf overall visit";
    return "the overall visit only";
  }
  if (labels.length === 1) return labels[0];
  const head = labels.slice(0, -1).join(", ");
  const tail = labels[labels.length - 1];
  const and = language === "hi" ? "और" : language === "hinglish" ? "aur" : "and";
  return `${head} ${and} ${tail}`;
}

export function attributeLabel(
  attribute: { label: string; labelHi: string; labelHinglish: string },
  language: ReviewLanguage,
) {
  if (language === "hi") return attribute.labelHi || attribute.label;
  if (language === "hinglish") return attribute.labelHinglish || attribute.label;
  return attribute.label;
}

export function buildPattern(input: {
  language: ReviewLanguage;
  tone: ReviewTone;
  length: ReviewLength;
  band: RatingBand;
  variant: 0 | 1;
}) {
  const parts = [
    openings[input.language][input.tone][input.variant],
    ratingLines[input.language][input.band],
    attributeLines[input.language][input.length],
  ];
  if (input.length === "detailed") parts.push(closing[input.language]);
  return parts.join(" ");
}

export function fillPattern(pattern: string, values: Record<string, string>) {
  return pattern.replace(/\{([a-z_]+)\}/g, (_, key: string) => values[key] ?? "").replace(/\s+/g, " ").trim();
}

export const TEMPLATE_CAP = 10000;

export function canImportTemplates(existing: number, incoming: number, cap = TEMPLATE_CAP) {
  if (incoming < 1) return { ok: false as const, error: "The file has no template rows." };
  if (incoming > cap) return { ok: false as const, error: `Import ${incoming} rows, which is above the ${cap} template cap.` };
  if (existing + incoming > cap) {
    return {
      ok: false as const,
      error: `This import would reach ${existing + incoming} templates. The cap is ${cap}.`,
    };
  }
  return { ok: true as const };
}
