import { requireAdmin } from "@/lib/auth/guards";
import { adminPlaces } from "@/repositories/lists";
import { ArchiveAdminPlace } from "@/components/admin/small-actions";
import { PageHeader } from "@/components/ui";

export const instant = false;

export default async function AdminPlacesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const places = await adminPlaces(params.q?.trim());
  return (
    <div>
      <PageHeader title="Places" />
      <form className="mb-4">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search" className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm" />
      </form>
      <div className="overflow-x-auto rounded-3xl bg-white ring-1 ring-stone-200">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-stone-500">
            <tr>
              <th className="px-4 py-3">Place</th>
              <th>Business</th>
              <th>Category</th>
              <th>Google review URL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {places.map((place) => (
              <tr key={place.id} className="border-t border-stone-100">
                <td className="px-4 py-3">{place.name}</td>
                <td>{place.business.name}</td>
                <td>{place.category.name}</td>
                <td className="max-w-xs truncate">{place.googleReviewUrl || "—"}</td>
                <td className="py-3 pr-4">
                  <ArchiveAdminPlace placeId={place.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
