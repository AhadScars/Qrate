import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { adminCategories, adminQrCodes } from "@/repositories/lists";
import { DeleteQrButton } from "@/components/admin/customer-controls";
import { AdminQrForm } from "@/components/admin/qr-form";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { qrDestination } from "@/lib/utils";

export const instant = false;

export default async function AdminQrPage() {
  await requireAdmin();
  const [categories, codes] = await Promise.all([
    adminCategories(),
    adminQrCodes(),
  ]);
  const activeCategories = categories.filter((category) => category.isActive).map((category) => ({ id: category.id, name: category.name }));

  return (
    <div>
      <PageHeader
        title="QR codes"
        body="You create every code. The customer scans it, writes from their own answers, and pastes the review on Google."
      />
      <Card>
        {activeCategories.length === 0 ? (
          <EmptyState title="Add a category first" body="Categories decide which feedback chips the customer sees." />
        ) : (
          <AdminQrForm categories={activeCategories} />
        )}
      </Card>
      <div className="mt-6 grid gap-4">
        {codes.length === 0 ? <EmptyState title="No QR codes yet" body="Create the first one above." /> : null}
        {codes.map((code) => (
          <Card key={code.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl">{code.place.name}</h2>
                  <Badge tone={code.isActive ? "green" : "red"}>{code.isActive ? "Active" : "Off"}</Badge>
                </div>
                <p className="text-sm text-stone-500">
                  {code.place.business.name} · {code.place.category.name} · {code.publicId}
                </p>
                <p className="mt-1 break-all text-sm text-indigo-700">{qrDestination(code.publicId)}</p>
                <p className="mt-2 text-sm text-stone-600">
                  {code._count.scans} scans · {code._count.generations} drafts · {code._count.events} tracked events
                </p>
              </div>
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
              <a className="rounded-full bg-white px-3 py-2 ring-1 ring-stone-200" href={`/r/${code.publicId}`} target="_blank" rel="noreferrer">
                Open review page
              </a>
              <DeleteQrButton qrId={code.id} label={code.place.business.name} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
