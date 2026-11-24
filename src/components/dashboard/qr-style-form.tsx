"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveQrStyleAction } from "@/lib/actions/owner";
import { Button } from "@/components/ui";

export function QrStyleForm({
  qrId,
  label,
  fgColor,
  bgColor,
  includeLogo,
}: {
  qrId: string;
  label: string;
  fgColor: string;
  bgColor: string;
  includeLogo: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <form
      className="mt-3 grid gap-2 text-sm"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await saveQrStyleAction({
          qrId,
          label: String(form.get("label") ?? ""),
          fgColor: String(form.get("fgColor") ?? "#312e81"),
          bgColor: String(form.get("bgColor") ?? "#ffffff"),
          includeLogo: form.get("includeLogo") === "on",
        });
        if (!result.ok) setError(result.error);
        else router.refresh();
      }}
    >
      <input name="label" defaultValue={label} className="h-10 rounded-xl border border-stone-200 px-3" placeholder="Label" />
      <div className="flex gap-3">
        <label className="flex items-center gap-2">
          Ink <input name="fgColor" type="color" defaultValue={fgColor} />
        </label>
        <label className="flex items-center gap-2">
          Paper <input name="bgColor" type="color" defaultValue={bgColor} />
        </label>
      </div>
      <label className="flex items-center gap-2">
        <input name="includeLogo" type="checkbox" defaultChecked={includeLogo} />
        Place the logo in the centre of the SVG. High error correction is used. Test a scan before you print a stack.
      </label>
      {error ? <p className="text-red-600">{error}</p> : null}
      <Button type="submit" variant="ghost">
        Save QR style
      </Button>
    </form>
  );
}
