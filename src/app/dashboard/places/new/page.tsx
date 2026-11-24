import { requireOwner } from "@/lib/auth/guards";
import { activeCategories } from "@/repositories/lists";
import { getBusinessAccess } from "@/services/subscriptions/service";
import { PlaceForm } from "@/components/dashboard/place-form";
import { PageHeader } from "@/components/ui";

export const instant = false;

export default async function NewPlacePage() {
  const owner = await requireOwner();
  const access = await getBusinessAccess(owner.business.id);
  const categories = await activeCategories();
  return (
    <div>
      <PageHeader title="New location" body="A QR code is created with the location." />
      {access.allowed ? (
        <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
          <PlaceForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
        </div>
      ) : (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">{access.reason}</p>
      )}
    </div>
  );
}
