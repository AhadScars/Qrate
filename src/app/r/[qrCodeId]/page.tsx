import { ReviewDesk } from "@/components/qr/review-desk";
import { loadPublicQr } from "@/services/reviews/service";

export const instant = false;

export default async function PublicReviewPage({ params }: { params: Promise<{ qrCodeId: string }> }) {
  const { qrCodeId } = await params;
  const loaded = await loadPublicQr(qrCodeId);
  if (!loaded.ok && loaded.reason === "paused") {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="font-display text-4xl">Reviews are paused</h1>
        <p className="mt-3 text-stone-600">{loaded.name} is not taking QR reviews right now.</p>
      </main>
    );
  }
  if (!loaded.ok) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="font-display text-4xl">This code is off</h1>
        <p className="mt-3 text-stone-600">Ask the business for a current QR code.</p>
      </main>
    );
  }
  const place = loaded.qr.place;
  return (
    <main className="min-h-screen bg-[#efeae2]">
      <ReviewDesk
        publicId={loaded.qr.publicId}
        placeName={place.name}
        categoryName={place.category.name}
        address={[place.address, place.city].filter(Boolean).join(", ")}
        welcome={place.welcomeMessage || place.category.welcomeMessage || `How was your experience at ${place.name}?`}
        logoUrl={place.logoUrl || place.business.logoUrl}
        googleReviewUrl={place.googleReviewUrl}
      />
    </main>
  );
}
