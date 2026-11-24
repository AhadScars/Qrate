import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { adminCustomers } from "@/repositories/lists";
import { platformCharts, platformStats } from "@/services/analytics/queries";
import { DeleteQrButton, QrToggle, ValidityForm } from "@/components/admin/customer-controls";
import { ScanChart } from "@/components/charts/scan-chart";
import { Badge, Card, EmptyState, PageHeader, Stat, statusTone } from "@/components/ui";
import { daysLeft, formatWhen, qrDestination } from "@/lib/utils";

export const instant = false;

function istDay(value: Date | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [customers, stats, charts] = await Promise.all([adminCustomers(), platformStats(), platformCharts()]);
  const now = new Date();
  const rows = customers.flatMap((business) => {
    const subscription = business.subscriptions[0] ?? null;
    const end = subscription?.endDate ?? subscription?.trialEnd ?? null;
    const valid = Boolean(end && end > now && subscription?.status !== "SUSPENDED" && subscription?.status !== "CANCELLED" && business.status === "ACTIVE");
    const places = business.places.length > 0 ? business.places : [null];
    return places.flatMap((place) => {
      const codes = place && place.qrCodes.length > 0 ? place.qrCodes : [null];
      return codes.map((qr) => ({
        key: qr?.id ?? place?.id ?? business.id,
        businessId: business.id,
        customer: business.name,
        place: place?.name ?? "No place yet",
        category: place?.category.name ?? "—",
        qrId: qr?.id ?? null,
        qrOn: qr?.isActive ?? false,
        publicId: qr?.publicId ?? null,
        scans: qr?._count.scans ?? 0,
        end,
        valid,
        status: business.status === "SUSPENDED" ? "SUSPENDED" : valid ? "ACTIVE" : "EXPIRED",
      }));
    });
  });

  return (
    <div>
      <PageHeader title="Customers" body="Turn a customer's QR on or off, delete it, and set how long their review page stays open." />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Customers" value={customers.length} />
        <Stat label="QR codes" value={stats.qrCodes} />
        <Stat label="Scans" value={stats.scans} />
        <Stat label="Open review pages" value={rows.filter((row) => row.valid && row.qrOn).length} />
      </div>
      <Card className="mt-4">
        <h2 className="font-semibold">Daily scans</h2>
        <ScanChart data={charts.daily} />
      </Card>
      {rows.length === 0 ? <EmptyState title="No customers yet" body="Create a QR code and the customer will show up here." /> : null}
      <div className="mt-4 grid gap-4">
        {rows.map((row) => (
          <Card key={row.key}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl">{row.customer}</h2>
                  <Badge tone={statusTone(row.status)}>{row.status === "ACTIVE" ? "Valid" : row.status === "SUSPENDED" ? "Suspended" : "Expired"}</Badge>
                  {row.qrId ? <Badge tone={row.qrOn ? "green" : "red"}>{row.qrOn ? "QR on" : "QR off"}</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-stone-500">{row.place} · {row.category}</p>
                <p className="mt-1 text-sm text-stone-600">
                  Valid until {formatWhen(row.end)} · {daysLeft(row.end)} days left · {row.scans} scans
                </p>
                {row.publicId ? <p className="mt-1 break-all text-sm text-indigo-700">{qrDestination(row.publicId)}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {row.qrId ? <QrToggle qrId={row.qrId} active={row.qrOn} /> : null}
                {row.qrId ? <DeleteQrButton qrId={row.qrId} label={row.customer} /> : null}
                {row.publicId ? (
                  <Link className="rounded-full bg-white px-3 py-2 text-sm font-semibold ring-1 ring-stone-200" href={`/r/${row.publicId}`}>
                    Open review page
                  </Link>
                ) : (
                  <Link className="rounded-full bg-indigo-700 px-3 py-2 text-sm font-semibold text-white" href="/admin/qr">
                    Create QR
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Validity</p>
              <ValidityForm businessId={row.businessId} endDate={istDay(row.end)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
