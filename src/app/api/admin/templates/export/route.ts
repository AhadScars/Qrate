import { NextResponse } from "next/server";
import { readAuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const auth = await readAuthUser();
  if (auth?.user.role !== "SUPER_ADMIN") return NextResponse.json({ ok: false }, { status: 401 });
  const templates = await prisma.reviewTemplate.findMany({ include: { category: true }, orderBy: { createdAt: "asc" } });
  const csv = toCsv(
    ["categorySlug", "language", "tone", "length", "ratingBand", "content", "isActive"],
    templates.map((template) => [
      template.category.slug,
      template.language,
      template.tone,
      template.length,
      template.ratingBand,
      template.content,
      template.isActive ? "true" : "false",
    ]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=qrate-templates.csv",
    },
  });
}
