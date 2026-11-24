import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { readAuthUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { sameOrigin } from "@/lib/security/origin";
import { rateLimit } from "@/lib/security/rate-limit";
import { safeJoin, storageRoot } from "@/lib/security/paths";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, error: "Bad origin." }, { status: 403 });
  const auth = await readAuthUser();
  const business = auth?.membership?.business;
  if (!auth || !business || business.deletedAt) {
    return NextResponse.json({ ok: false, error: "Sign in as a business owner." }, { status: 401 });
  }
  const limit = rateLimit(`upload:${auth.user.id}`, 20, 60 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ ok: false, error: "Too many uploads." }, { status: 429 });

  const form = await request.formData();
  const file = form.get("file");
  const target = String(form.get("target") ?? "");
  const placeId = String(form.get("placeId") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Choose an image." }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ ok: false, error: "Images must be under 2 MB." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = sniff(bytes);
  if (!kind) return NextResponse.json({ ok: false, error: "Use a PNG, JPG, or WebP file." }, { status: 400 });

  const filename = `${randomUUID()}.${kind === "jpg" ? "jpg" : kind}`;
  const directory = safeJoin(storageRoot(), business.id);
  await mkdir(directory, { recursive: true });
  await writeFile(safeJoin(directory, filename), bytes);
  const logoUrl = `/api/media/${business.id}/${filename}`;

  if (target === "place") {
    const place = await prisma.place.findFirst({ where: { id: placeId, businessId: business.id, deletedAt: null } });
    if (!place) return NextResponse.json({ ok: false, error: "Location not found." }, { status: 404 });
    await prisma.place.update({ where: { id: place.id }, data: { logoUrl } });
  } else {
    await prisma.business.update({ where: { id: business.id }, data: { logoUrl } });
  }
  return NextResponse.json({ ok: true, logoUrl });
}

function sniff(bytes: Buffer) {
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length > 12 && bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}
