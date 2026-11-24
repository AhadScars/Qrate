import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { adminBusiness } from "@/repositories/lists";
import { BusinessControls } from "@/components/admin/business-controls";
import { Badge, Card, PageHeader, statusTone } from "@/components/ui";
import { formatInr, formatWhen } from "@/lib/utils";

export const instant = false;

export default async function AdminBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const business = await adminBusiness(id);
  if (!business) notFound();
  return (
    <div>
      <PageHeader title={business.name} body={business.owner.email} />
      <Card>
        <BusinessControls businessId={business.id} name={business.name} phone={business.phone ?? ""} />
      </Card>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Locations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {business.places.map((place) => (
              <li key={place.id}>
                {place.name} · {place.category.name} · {place.qrCodes.length} QR
                <p className="text-stone-500">{place.googleReviewUrl || "No Google review URL"}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h2 className="font-semibold">Subscription history</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {business.subscriptions.map((subscription) => (
              <li key={subscription.id}>
                <Badge tone={statusTone(subscription.status)}>{subscription.status}</Badge> {subscription.planName} · {subscription.paymentStatus} · ends {formatWhen(subscription.endDate ?? subscription.trialEnd)}
              </li>
            ))}
          </ul>
          <h2 className="mt-5 font-semibold">Payments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {business.payments.map((payment) => (
              <li key={payment.id}>
                {formatInr(payment.amountPaise)} · {payment.status} · {payment.reference || "no reference"}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
