import { Suspense } from "react";
import { requireOwner } from "@/lib/auth/guards";
import { recentAuditsForActor } from "@/repositories/lists";
import { getBusinessAccess } from "@/services/subscriptions/service";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { formatWhen } from "@/lib/utils";

export const instant = false;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading workspace…</div>}>
      <DashboardFrame>{children}</DashboardFrame>
    </Suspense>
  );
}

async function DashboardFrame({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();
  const access = await getBusinessAccess(owner.business.id);
  const audits = await recentAuditsForActor(owner.user.id);
  const accessLabel = access.allowed
    ? `${access.state === "TRIAL" ? "Trial" : "Plan"} until ${formatWhen(access.endsAt)}`
    : access.reason;
  return (
    <DashboardShell
      name={owner.user.name}
      email={owner.user.email}
      businessName={owner.business.name}
      accessLabel={accessLabel}
      notices={audits.map((item) => ({ id: item.id, text: `${item.action} · ${formatWhen(item.createdAt)}` }))}
    >
      {!access.allowed ? (
        <div className="mb-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {access.reason} Public QR pages and new locations stay off until access is active. You can still open subscription and settings.
        </div>
      ) : null}
      {children}
    </DashboardShell>
  );
}
