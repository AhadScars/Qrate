import { PrismaClient } from "@prisma/client";
import { buildUniqueCorpus, splitSentences } from "../src/services/reviews/unique-corpus";

const prisma = new PrismaClient();

function key(sentence: string) {
  return sentence.toLowerCase().replace(/[.!?।]+$/g, "").replace(/\s+/g, " ").trim();
}

async function main() {
  const built = buildUniqueCorpus();
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const bySlug = new Map(categories.map((category) => [category.slug, category.id]));
  const missing = [...new Set(built.map((row) => row.slug))].filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) throw new Error(`Missing categories: ${missing.join(", ")}`);
  const data = built.map((row) => ({
    categoryId: bySlug.get(row.slug) ?? "",
    language: row.language,
    tone: row.tone,
    length: row.length,
    ratingBand: row.ratingBand,
    content: row.content,
    isActive: true,
  }));
  const before = await prisma.reviewTemplate.count();
  console.log(`Replacing ${before} templates with ${data.length}.`);
  await prisma.reviewTemplate.deleteMany();
  for (let index = 0; index < data.length; index += 200) {
    await prisma.reviewTemplate.createMany({ data: data.slice(index, index + 200) });
    console.log(`Inserted ${Math.min(index + 200, data.length)} / ${data.length}`);
  }
  const stored = await prisma.reviewTemplate.findMany({ select: { content: true } });
  const seen = new Set<string>();
  let sentences = 0;
  for (const row of stored) {
    for (const sentence of splitSentences(row.content)) {
      sentences += 1;
      seen.add(key(sentence));
    }
  }
  console.log(JSON.stringify({ templates: stored.length, sentences, uniqueSentences: seen.size }));
  if (stored.length !== data.length || seen.size !== sentences) {
    throw new Error("Uploaded reviews are not unique.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
