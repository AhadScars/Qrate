import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { catalog } from "./catalog";
import { BANDS, buildPattern, LANGUAGES, LENGTHS, TONES } from "../src/services/reviews/patterns";
import { SETTING_DEFAULTS } from "../src/lib/config/settings";

const prisma = new PrismaClient();

async function main() {
  if (process.env.VERCEL && !process.env.ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_PASSWORD in Vercel before deploying. Do not paste it into chat.");
  }
  const email = (process.env.ADMIN_EMAIL || "admin@qrate.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Qrate-Admin-2026!";
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", isActive: true, name: "Qrate Admin" },
    create: { email, passwordHash, name: "Qrate Admin", role: "SUPER_ADMIN" },
  });

  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await prisma.adminSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  for (const category of catalog) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        welcomeMessage: category.welcomeMessage,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        welcomeMessage: category.welcomeMessage,
      },
    });
    for (const [index, attribute] of category.attributes.entries()) {
      await prisma.categoryAttribute.upsert({
        where: { categoryId_key: { categoryId: saved.id, key: attribute.key } },
        update: {
          label: attribute.label,
          labelHi: attribute.labelHi,
          labelHinglish: attribute.labelHinglish,
          sortOrder: index,
          isActive: true,
        },
        create: {
          categoryId: saved.id,
          key: attribute.key,
          label: attribute.label,
          labelHi: attribute.labelHi,
          labelHinglish: attribute.labelHinglish,
          sortOrder: index,
        },
      });
    }
  }

  const templateCount = await prisma.reviewTemplate.count();
  if (templateCount === 0) {
    const categories = await prisma.category.findMany();
    const rows: {
      categoryId: string;
      language: string;
      tone: string;
      length: string;
      ratingBand: string;
      content: string;
    }[] = [];
    for (const category of categories) {
      for (const language of LANGUAGES) {
        for (const tone of TONES) {
          for (const length of LENGTHS) {
            for (const band of BANDS) {
              for (const variant of [0, 1] as const) {
                rows.push({
                  categoryId: category.id,
                  language,
                  tone,
                  length,
                  ratingBand: band,
                  content: buildPattern({ language, tone, length, band, variant }),
                });
              }
            }
          }
        }
      }
    }
    for (let index = 0; index < rows.length; index += 500) {
      await prisma.reviewTemplate.createMany({ data: rows.slice(index, index + 500) });
    }
    console.log(`Seeded ${rows.length} review patterns.`);
  } else {
    console.log(`Kept ${templateCount} existing review templates.`);
  }

  console.log(`Admin ready: ${admin.email}`);
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
