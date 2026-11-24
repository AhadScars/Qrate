import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { safeJoin, storageRoot } from "@/lib/security/paths";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await context.params;
  if (!parts?.length || parts.length > 2) return NextResponse.json({ ok: false }, { status: 404 });
  try {
    const filePath = safeJoin(storageRoot(), ...parts);
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime(filePath),
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}

function mime(filePath: string) {
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "image/png";
}
