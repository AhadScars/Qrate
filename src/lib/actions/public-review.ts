"use server";

import { cookies, headers } from "next/headers";
import { hashToken, newToken } from "@/lib/auth/password";
import { clientIpFromHeaders } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rate-limit";
import { generateSchema, zodError } from "@/lib/validation/schemas";
import { generatePublicDraft, recordScan, trackReviewEvent, VISITOR_COOKIE } from "@/services/reviews/service";

export async function recordScanAction(publicId: string) {
  const ip = await clientIpFromHeaders();
  const limit = rateLimit(`scan:${publicId}:${ip ?? "local"}`, 30, 10 * 60 * 1000);
  if (!limit.ok) return { ok: false as const };
  const jar = await cookies();
  let visitor = jar.get(VISITOR_COOKIE)?.value ?? null;
  if (!visitor) {
    visitor = newToken();
    jar.set(VISITOR_COOKIE, visitor, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  const headerList = await headers();
  return recordScan(publicId, hashToken(visitor), headerList.get("user-agent"));
}

export async function generateDraftAction(input: unknown) {
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  if (parsed.data.companyWebsite) return { ok: false as const, error: "Could not prepare a draft." };
  const ip = await clientIpFromHeaders();
  const limit = rateLimit(`draft:${parsed.data.publicId}:${ip ?? "local"}`, 40, 10 * 60 * 1000);
  if (!limit.ok) return { ok: false as const, error: "Too many drafts. Wait a few minutes." };
  return generatePublicDraft(parsed.data);
}

export async function trackReviewAction(publicId: string, type: "COPY" | "GOOGLE_CLICK") {
  const ip = await clientIpFromHeaders();
  const limit = rateLimit(`event:${publicId}:${ip ?? "local"}`, 60, 10 * 60 * 1000);
  if (!limit.ok) return { ok: false as const };
  return trackReviewEvent(publicId, type);
}
