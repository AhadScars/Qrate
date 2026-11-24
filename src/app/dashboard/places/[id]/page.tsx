import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/guards";
import { activeCategories, ownerPlace } from "@/repositories/lists";
import { PlaceForm } from "@/components/dashboard/place-form";
import { LogoUpload } from "@/components/dashboard/logo-upload";
import { ArchivePlaceButton } from "@/components/dashboard/danger-buttons";
import { PageHeader } from "@/components/ui";
import { qrDestination } from "@/lib/utils";

export const instant = false;

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwner();
  const { id } = await params;
  const [place, categories] = await Promise.all([ownerPlace(owner.business.id, id), activeCategories()]);
  if (!place) notFound();
  return (
    <div>
      <PageHeader title={place.name} body={place.category.name} />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
          <PlaceForm
            placeId={place.id}
            categories={categories.map((category) => ({ id: category.id, name: category.name }))}
            initial={{
              name: place.name,
              categoryId: place.categoryId,
              address: place.address ?? "",
              city: place.city ?? "",
              googleBusinessName: place.googleBusinessName ?? "",
              googleMapsUrl: place.googleMapsUrl ?? "",
              googleReviewUrl: place.googleReviewUrl ?? "",
              welcomeMessage: place.welcomeMessage ?? "",
            }}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-semibold">Logo</h2>
            <LogoUpload target="place" placeId={place.id} current={place.logoUrl} />
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
            <h2 className="font-semibold">QR codes</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {place.qrCodes.map((qr) => (
                <li key={qr.id}>
                  <Link className="font-semibold text-indigo-700" href="/dashboard/qr-codes">
                    {qr.label || qr.publicId}
                  </Link>
                  <p className="break-all text-stone-500">{qrDestination(qr.publicId)}</p>
                </li>
              ))}
            </ul>
          </div>
          <ArchivePlaceButton placeId={place.id} />
        </div>
      </div>
    </div>
  );
}
