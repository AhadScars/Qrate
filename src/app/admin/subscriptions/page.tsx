import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { adminSubscriptions } from "@/repositories/lists";
import { Badge, PageHeader, statusTone } from "@/components/ui";
import { formatInr, formatWhen } from "@/lib/utils";

export const instant = false;

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const rows = await adminSubscriptions();
  return (
    <div>
      <PageHeader title="Subscriptions" body="Open a business to activate, extend, or suspend." />
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Ends</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <Link className="font-semibold text-indigo-700" href={`/admin/businesses/${row.businessId}`}>
                    {row.business.name}
                  </Link>
                </td>
                <td>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </td>
                <td>{row.paymentStatus}</td>
                <td>{formatInr(row.amountPaise)}</td>
                <td>{formatWhen(row.endDate ?? row.trialEnd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
