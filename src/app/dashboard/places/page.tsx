import Link from "next/link";
import { requireOwner } from "@/lib/auth/guards";
import { ownerPlaces } from "@/repositories/lists";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const instant = false;

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const owner = await requireOwner();
  const params = await searchParams;
  const places = await ownerPlaces(owner.business.id, params.q?.trim());
  return (
    <div>
      <PageHeader
        title="Places"
        body="Each location gets its own Google review link and QR code."
        action={
          <Link href="/dashboard/places/new" className="rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">
            Add location
          </Link>
        }
      />
      <form className="mb-4">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search name, city, or address" className="h-11 w-full max-w-md rounded-full border border-stone-200 bg-white px-4 text-sm" />
      </form>
      {places.length === 0 ? <EmptyState title="No locations yet" body="Add the counter, clinic, or shop you want customers to review." /> : null}
      <div className="grid gap-4">
        {places.map((place) => (
          <Link key={place.id} href={`/dashboard/places/${place.id}`}>
            <Card className="transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl">{place.name}</h2>
                  <p className="text-sm text-stone-500">
                    {place.category.name}
                    {place.city ? ` · ${place.city}` : ""}
                  </p>
                </div>
                <Badge tone={place.isActive ? "green" : "slate"}>{place.isActive ? "Active" : "Off"}</Badge>
              </div>
              <p className="mt-3 text-sm text-stone-600">{place.qrCodes.length} QR code{place.qrCodes.length === 1 ? "" : "s"}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
