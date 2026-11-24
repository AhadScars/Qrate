import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/shell/admin-shell";

export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading admin…</div>}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}

async function AdminFrame({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell name={admin.name}>{children}</AdminShell>;
}
