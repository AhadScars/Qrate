import { NextResponse } from "next/server";
import { loadQrForActor } from "@/lib/qr/access";
import { renderQrSvg } from "@/lib/qr/render";
import { safeJoin, storageRoot } from "@/lib/security/paths";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const qr = await loadQrForActor(id);
  if (!qr) return NextResponse.json({ ok: false }, { status: 404 });
  const logoUrl = qr.place.logoUrl || qr.place.business.logoUrl;
  const logoPath = logoFile(logoUrl);
  const svg = await renderQrSvg({
    publicId: qr.publicId,
    fgColor: qr.fgColor,
    bgColor: qr.bgColor,
    includeLogo: qr.includeLogo,
    logoPath,
    logoMime: logoPath?.endsWith(".webp") ? "image/webp" : logoPath?.endsWith(".jpg") ? "image/jpeg" : "image/png",
  });
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="qrate-${qr.publicId}.svg"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function logoFile(url: string | null) {
  if (!url?.startsWith("/api/media/")) return null;
  const parts = url.replace("/api/media/", "").split("/").filter(Boolean);
  try {
    return safeJoin(storageRoot(), ...parts);
  } catch {
    return null;
  }
}
