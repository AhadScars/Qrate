import { prisma } from "@/lib/db/prisma";
import { hashPassword, hashToken, newToken, verifyPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/utils";
import { openTrial } from "@/services/subscriptions/service";
import { audit } from "@/lib/audit";

export async function createOwnerAccount(input: {
  name: string;
  email: string;
  password: string;
  businessName: string;
  phone?: string;
}) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false as const, error: "An account with this email already exists." };

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email,
      passwordHash,
      role: "OWNER",
      phone: input.phone || null,
    },
  });

  let slug = slugify(input.businessName);
  const clash = await prisma.business.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${newToken().slice(0, 6).toLowerCase()}`;

  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: input.businessName,
      slug,
      email,
      phone: input.phone || null,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  await openTrial(business.id);
  await audit(user.id, "account.register", "Business", business.id);
  return { ok: true as const, userId: user.id, businessId: business.id };
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.deletedAt) return { ok: false as const, error: "Invalid email or password." };
  const match = await verifyPassword(password, user.passwordHash);
  if (!match) return { ok: false as const, error: "Invalid email or password." };
  if (!user.isActive) return { ok: false as const, error: "This account is disabled." };
  return { ok: true as const, user };
}

export async function createPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive || user.deletedAt) return null;
  const token = newToken();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return { token, userId: user.id };
}

export async function resetPassword(token: string, password: string) {
  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
    return { ok: false as const, error: "This reset link is invalid or expired." };
  }
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    prisma.authSession.deleteMany({ where: { userId: reset.userId } }),
  ]);
  await audit(reset.userId, "account.password_reset", "User", reset.userId);
  return { ok: true as const };
}

export async function updateOwnerProfile(userId: string, businessId: string, input: { name: string; phone?: string }) {
  await prisma.$transaction([
    prisma.business.update({
      where: { id: businessId },
      data: { name: input.name, phone: input.phone || null },
    }),
    prisma.user.update({ where: { id: userId }, data: { phone: input.phone || null } }),
  ]);
  await audit(userId, "business.profile", "Business", businessId);
}
