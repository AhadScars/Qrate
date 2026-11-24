import { requireOwner } from "@/lib/auth/guards";
import { ownerSubscription } from "@/repositories/lists";
import { businessStats, scanCharts } from "@/services/analytics/queries";
import { getBusinessAccess } from "@/services/subscriptions/service";
import { ScanChart } from "@/components/charts/scan-chart";
import { Card, PageHeader, Stat } from "@/components/ui";
import { formatWhen } from "@/lib/utils";

export const instant = false;

export default async function OverviewPage() {
  const owner = await requireOwner();
  const [stats, charts, access, subscription] = await Promise.all([
    businessStats(owner.business.id),
    scanCharts(owner.business.id),
    getBusinessAccess(owner.business.id),
    ownerSubscription(owner.business.id),
  ]);
  return (
    <div>
      <PageHeader title="Overview" body="Counts come from scans, drafts, and clicks on your own QR codes." />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Places" value={stats.places} />
        <Stat label="QR codes" value={stats.qrCodes} />
        <Stat label="QR scans" value={stats.scans} hint={`${stats.uniqueVisitors} unique visitors`} />
        <Stat label="Drafts" value={stats.drafts} hint={`${stats.copies} copies · ${stats.googleClicks} Google clicks`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Daily scans</h2>
          <ScanChart data={charts.daily} />
        </Card>
        <Card>
          <h2 className="font-semibold">Weekly scans</h2>
          <ScanChart data={charts.weekly} color="#0f766e" />
        </Card>
        <Card>
          <h2 className="font-semibold">Monthly scans</h2>
          <ScanChart data={charts.monthly} color="#b45309" />
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Location performance</h2>
          {charts.byPlace.length === 0 ? <p className="mt-4 text-sm text-stone-500">No scans yet.</p> : <ScanChart data={charts.byPlace} />}
        </Card>
        <Card>
          <h2 className="font-semibold">Subscription</h2>
          <p className="mt-3 text-sm text-stone-600">{access.reason}</p>
          <p className="mt-2 text-sm">Status: {subscription?.status ?? "NONE"}</p>
          <p className="text-sm">Payment: {subscription?.paymentStatus ?? "UNPAID"}</p>
          <p className="text-sm">Ends: {formatWhen(access.endsAt)}</p>
          <h3 className="mt-6 font-semibold">QR performance</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {charts.byQr.length === 0 ? <li className="text-stone-500">No QR scans yet.</li> : null}
            {charts.byQr.map((item) => (
              <li key={item.label} className="flex justify-between gap-3">
                <span>{item.label}</span>
                <span className="font-semibold">{item.scans}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
