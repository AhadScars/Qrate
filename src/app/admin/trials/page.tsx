import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { adminTrials } from "@/repositories/lists";
import { PageHeader } from "@/components/ui";
import { daysLeft, formatWhen } from "@/lib/utils";

export const instant = false;

export default async function TrialsPage() {
  await requireAdmin();
  const trials = await adminTrials();
  return (
    <div>
      <PageHeader title="Trials" body="Extend or disable a trial from the business page." />
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th>Ends</th>
              <th>Days left</th>
              <th>Extended</th>
              <th>Disabled</th>
            </tr>
          </thead>
          <tbody>
            {trials.map((trial) => (
              <tr key={trial.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <Link className="font-semibold text-indigo-700" href={`/admin/businesses/${trial.businessId}`}>
                    {trial.business.name}
                  </Link>
                </td>
                <td>{formatWhen(trial.endDate)}</td>
                <td>{daysLeft(trial.endDate)}</td>
                <td>{trial.extendedBy}</td>
                <td>{trial.isDisabled ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
