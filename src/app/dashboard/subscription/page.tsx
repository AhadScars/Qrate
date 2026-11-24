import { requireOwner } from "@/lib/auth/guards";
import { getSettings, planFromSettings } from "@/lib/config/settings";
import { ownerPayments, ownerSubscription } from "@/repositories/lists";
import { getBusinessAccess } from "@/services/subscriptions/service";
import { SubscriptionActions } from "@/components/dashboard/subscription-actions";
import { Badge, Card, PageHeader, statusTone } from "@/components/ui";
import { daysLeft, formatInr, formatWhen } from "@/lib/utils";

export const instant = false;

export default async function SubscriptionPage() {
  const owner = await requireOwner();
  const [access, subscription, payments, settings] = await Promise.all([
    getBusinessAccess(owner.business.id),
    ownerSubscription(owner.business.id),
    ownerPayments(owner.business.id),
    getSettings(),
  ]);
  const plan = planFromSettings(settings);
  return (
    <div>
      <PageHeader title="Subscription" body="The super admin turns a plan on by setting the validity date. There is no online checkout." />
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-3xl">{plan.planName}</h2>
          <Badge tone={statusTone(access.state)}>{access.state}</Badge>
        </div>
        <p className="mt-2 text-sm text-stone-600">{access.reason}</p>
        <p className="mt-3 text-sm">Price {formatInr(plan.amountPaise)} · {plan.durationDays} days</p>
        <p className="text-sm">Ends {formatWhen(access.endsAt)} · {daysLeft(access.endsAt)} day(s) left</p>
        <p className="text-sm">Stored status {subscription?.status ?? "NONE"} · payment {subscription?.paymentStatus ?? "UNPAID"}</p>
        <SubscriptionActions />
      </Card>
      <h2 className="mb-3 mt-8 font-semibold">Payment requests</h2>
      <div className="grid gap-3">
        {payments.length === 0 ? <p className="text-sm text-stone-500">No payments yet.</p> : null}
        {payments.map((payment) => (
          <Card key={payment.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">
                {formatInr(payment.amountPaise)} · {payment.provider}
              </p>
              <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {payment.reference || "No reference yet"} · {formatWhen(payment.createdAt)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
