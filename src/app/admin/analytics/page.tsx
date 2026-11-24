import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { platformCharts, platformStats } from "@/services/analytics/queries";
import { ScanChart } from "@/components/charts/scan-chart";
import { Card, PageHeader, Stat } from "@/components/ui";

export const instant = false;

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const [stats, charts, businesses] = await Promise.all([
    platformStats(),
    platformCharts(),
    prisma.business.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { places: true } }, subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  const trials = stats.trials;
  const converted = stats.activePaid;
  const conversion = trials + converted === 0 ? 0 : Math.round((converted / (trials + converted)) * 100);
  return (
    <div>
      <PageHeader title="Analytics" body="Platform scans and a simple trial-to-paid view." />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Scans" value={stats.scans} />
        <Stat label="Paid plans" value={stats.activePaid} />
        <Stat label="Trial share still open" value={`${conversion}%`} hint="Paid divided by open trials plus paid. Not a cohort forecast." />
      </div>
      <Card className="mt-4">
        <h2 className="font-semibold">Monthly scans</h2>
        <ScanChart data={charts.monthly} />
      </Card>
      <Card className="mt-4">
        <h2 className="font-semibold">Newest businesses</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {businesses.map((business) => (
            <li key={business.id} className="flex justify-between gap-3">
              <span>{business.name}</span>
              <span className="text-stone-500">
                {business._count.places} places · {business.subscriptions[0]?.status ?? "NONE"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
