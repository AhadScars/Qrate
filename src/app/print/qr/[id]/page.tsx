import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { DigiHubMark } from "@/components/brand";
import { loadQrForActor } from "@/lib/qr/access";
import { qrDestination } from "@/lib/utils";

export const instant = false;

export default async function PrintQrPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const qr = await loadQrForActor(id);
  if (!qr) notFound();
  return (
    <main className="mx-auto min-h-screen max-w-xl bg-white px-8 py-10 text-center text-stone-950">
      {qr.place.logoUrl || qr.place.business.logoUrl ? (
        // The logo stays above the code so a centre image does not break scanning.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr.place.logoUrl || qr.place.business.logoUrl || ""} alt="" className="mx-auto h-16 w-16 rounded-2xl object-cover" />
      ) : null}
      <h1 className="mt-4 font-display text-4xl">{qr.place.name}</h1>
      <p className="mt-2 text-stone-600">Scan to share your own review.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/qr/${qr.id}/png`} alt="" className="mx-auto mt-6 h-72 w-72" />
      <p className="mt-4 text-sm text-stone-500">{qrDestination(qr.publicId)}</p>
      <DigiHubMark className="mt-8 text-sm font-semibold text-stone-600" />
    </main>
  );
}
