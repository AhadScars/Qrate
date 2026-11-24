import { ReviewDesk } from "@/components/qr/review-desk";
import { loadPublicQr } from "@/services/reviews/service";

export const instant = false;

export default async function PublicReviewPage({ params }: { params: Promise<{ qrCodeId: string }> }) {
  const { qrCodeId } = await params;
  const loaded = await loadPublicQr(qrCodeId);
  if (!loaded.ok && loaded.reason === "paused") {
    return (
      <main className="mx-auto min-h-dvh max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-4xl leading-tight">Reviews are paused</h1>
        <p className="mt-3 text-stone-600">{loaded.name} is not taking QR reviews right now.</p>
      </main>
    );
  }
  if (!loaded.ok) {
    return (
      <main className="mx-auto min-h-dvh max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-4xl leading-tight">This code is off</h1>
        <p className="mt-3 text-stone-600">Ask the business for a current QR code.</p>
      </main>
    );
  }
  const place = loaded.qr.place;
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top,#fff7ed,#efeae2_46%,#e6e0d6)] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8">
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
