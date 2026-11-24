"use server";

import { redirect } from "next/navigation";
import { clientIpFromHeaders, createSession, destroySession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rate-limit";
import { forgotSchema, loginSchema, resetSchema, zodError } from "@/lib/validation/schemas";
import { authenticate, createPasswordReset, resetPassword } from "@/services/accounts/service";
import { sendPasswordReset } from "@/lib/email/send";
import { appUrl } from "@/lib/utils";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/db/prisma";

export async function registerAction(_input: unknown) {
  return { ok: false as const, error: "Signups are closed. The super admin creates the QR codes." };
}

export async function loginAction(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const ip = await clientIpFromHeaders();
  const limit = rateLimit(`login:${ip ?? "local"}:${parsed.data.email.toLowerCase()}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return { ok: false as const, error: "Too many sign-in attempts. Wait a few minutes." };
  const auth = await authenticate(parsed.data.email, parsed.data.password);
  if (!auth.ok) return auth;
  if (auth.user.role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Only the super admin can sign in." };
  }
  await createSession(auth.user.id);
  await audit(auth.user.id, "account.login", "User", auth.user.id);
  redirect("/admin/overview");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function forgotAction(input: unknown) {
  const parsed = forgotSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const ip = await clientIpFromHeaders();
  const limit = rateLimit(`forgot:${ip ?? "local"}`, 6, 60 * 60 * 1000);
  if (!limit.ok) return { ok: false as const, error: "Too many reset requests. Try again later." };
  const reset = await createPasswordReset(parsed.data.email);
  if (!reset) return { ok: true as const, devLink: null };
  const resetUrl = `${appUrl()}/reset-password?token=${reset.token}`;
  const email = await sendPasswordReset(parsed.data.email, resetUrl);
  return { ok: true as const, devLink: email.delivered ? null : resetUrl };
}

export async function resetAction(input: unknown) {
  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const result = await resetPassword(parsed.data.token, parsed.data.password);
  if (!result.ok) return result;
  redirect("/login?reset=1");
}

export async function assertOwnerStillActive(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return Boolean(user?.isActive && !user.deletedAt);
}
