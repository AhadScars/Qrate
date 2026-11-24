import { NextResponse } from "next/server";
import { loadQrForActor } from "@/lib/qr/access";
import { renderQrPng } from "@/lib/qr/render";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const qr = await loadQrForActor(id);
  if (!qr) return NextResponse.json({ ok: false }, { status: 404 });
  const png = await renderQrPng({ publicId: qr.publicId, fgColor: qr.fgColor, bgColor: qr.bgColor });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qrate-${qr.publicId}.png"`,
      "Cache-Control": "private, no-store",
    },
  });
}
