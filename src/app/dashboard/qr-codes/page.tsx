import Link from "next/link";
import { requireOwner } from "@/lib/auth/guards";
import { ownerQrCodes } from "@/repositories/lists";
import { AddQrButton } from "@/components/dashboard/add-qr-button";
import { QrActiveButton, RegenerateButton } from "@/components/dashboard/danger-buttons";
import { QrStyleForm } from "@/components/dashboard/qr-style-form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { qrDestination } from "@/lib/utils";

export const instant = false;

export default async function QrPage() {
  const owner = await requireOwner();
  const codes = await ownerQrCodes(owner.business.id);
  return (
    <div>
      <PageHeader title="QR codes" body="Download PNG or SVG, or open a print sheet. Old codes keep working when branding changes." />
      {codes.length === 0 ? <EmptyState title="No QR codes" body="Add a location first. Its code is created with it." /> : null}
      <div className="grid gap-4">
        {codes.map((code) => (
          <Card key={code.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl">{code.place.name}</h2>
                  <Badge tone={code.isActive ? "green" : "red"}>{code.isActive ? "Active" : "Off"}</Badge>
                </div>
                <p className="text-sm text-stone-500">{code.label || "Untitled code"} · {code.publicId}</p>
                <p className="mt-1 break-all text-sm text-indigo-700">{qrDestination(code.publicId)}</p>
                <p className="mt-2 text-sm text-stone-600">
                  {code._count.scans} scans · {code._count.generations} drafts · {code._count.events} tracked events
                </p>
              </div>
              {/* The image route checks the session before drawing the code. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/qr/${code.id}/png`} alt={`QR code for ${code.place.name}`} className="h-28 w-28 rounded-xl bg-white ring-1 ring-stone-200" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <a className="rounded-full bg-slate-950 px-3 py-2 text-white" href={`/api/qr/${code.id}/png`} download>
                PNG
              </a>
              <a className="rounded-full bg-white px-3 py-2 ring-1 ring-stone-200" href={`/api/qr/${code.id}/svg`} download>
                SVG
              </a>
              <Link className="rounded-full bg-white px-3 py-2 ring-1 ring-stone-200" href={`/print/qr/${code.id}`}>
                Print sheet
              </Link>
              <QrActiveButton qrId={code.id} isActive={code.isActive} />
              <RegenerateButton qrId={code.id} />
              <AddQrButton placeId={code.placeId} />
            </div>
            <QrStyleForm qrId={code.id} label={code.label ?? ""} fgColor={code.fgColor} bgColor={code.bgColor} includeLogo={code.includeLogo} />
          </Card>
        ))}
      </div>
    </div>
  );
}
