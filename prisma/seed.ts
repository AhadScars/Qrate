import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { catalog } from "./catalog";
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
  console.log(`Kept ${templateCount} review templates. Import new ones from the admin page.`);

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
