import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { hashToken, newToken } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/cookie";

export { SESSION_COOKIE };
const SESSION_DAYS = 14;

export async function createSession(userId: string) {
  const token = newToken();
  const headerList = await headers();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.authSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      userAgent: headerList.get("user-agent")?.slice(0, 240) ?? null,
      ip: clientIp(headerList),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function readAuthUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          memberships: {
            include: { business: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive || session.user.deletedAt) {
    return null;
  }
  const membership = session.user.memberships.find((item) => !item.business.deletedAt) ?? null;
  return { sessionId: session.id, user: session.user, membership };
}

export async function clientIpFromHeaders() {
  return clientIp(await headers());
}

function clientIp(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 64) || null;
  return headerList.get("x-real-ip")?.slice(0, 64) ?? null;
}
