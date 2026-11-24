import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { adminPayments } from "@/repositories/lists";
import { MarkPaidButton } from "@/components/admin/small-actions";
import { Badge, PageHeader, statusTone } from "@/components/ui";
import { formatInr, formatWhen } from "@/lib/utils";

export const instant = false;

export default async function AdminPaymentsPage() {
  await requireAdmin();
  const payments = await adminPayments();
  return (
    <div>
      <PageHeader title="Payments" body="Marking paid checks the reference and then creates an active subscription. A browser success message cannot do that." />
      <div className="grid gap-3">
        {payments.map((payment) => (
          <article key={payment.id} className="rounded-3xl bg-white p-4 ring-1 ring-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/businesses/${payment.businessId}`} className="font-semibold text-indigo-700">
                {payment.business.name}
              </Link>
              <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              {formatInr(payment.amountPaise)} · {payment.provider} · {payment.reference || "no reference"} · {formatWhen(payment.createdAt)}
            </p>
            {payment.status !== "PAID" ? (
              <div className="mt-3">
                <MarkPaidButton paymentId={payment.id} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
