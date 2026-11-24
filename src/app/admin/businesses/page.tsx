import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { adminBusinesses } from "@/repositories/lists";
import { Badge, PageHeader, statusTone } from "@/components/ui";
import { formatWhen } from "@/lib/utils";

export const instant = false;

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const businesses = await adminBusinesses(params.q?.trim(), params.status);
  return (
    <div>
      <PageHeader title="Businesses" body="Search by name, email, or slug." />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search" className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm" />
        <select name="status" defaultValue={params.status ?? ""} className="h-11 rounded-full border border-stone-200 bg-white px-3 text-sm">
          <option value="">Any status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
        <button className="rounded-full bg-indigo-700 px-4 text-sm font-semibold text-white">Filter</button>
      </form>
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Places</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr key={business.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <Link className="font-semibold text-indigo-700" href={`/admin/businesses/${business.id}`}>
                    {business.name}
                  </Link>
                </td>
                <td>{business.owner.email}</td>
                <td>
                  <Badge tone={statusTone(business.status)}>{business.status}</Badge>
                </td>
                <td>{business.subscriptions[0]?.status ?? "NONE"}</td>
                <td>{business._count.places}</td>
                <td>{formatWhen(business.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
