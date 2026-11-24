import { redirect } from "next/navigation";
import { readAuthUser } from "@/lib/auth/session";

export async function requireUser() {
  const auth = await readAuthUser();
  if (!auth) redirect("/login");
  return auth;
}

export async function requireOwner() {
  const auth = await requireUser();
  if (auth.user.role === "SUPER_ADMIN") redirect("/admin/overview");
  if (!auth.membership || auth.membership.business.deletedAt) redirect("/login");
  return {
    user: auth.user,
    business: auth.membership.business,
    memberRole: auth.membership.role,
  };
}

export async function requireAdmin() {
  const auth = await requireUser();
  if (auth.user.role !== "SUPER_ADMIN") redirect("/dashboard/overview");
  return auth.user;
}
