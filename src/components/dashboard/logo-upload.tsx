"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoUpload({ target, placeId, current }: { target: "business" | "place"; placeId?: string; current?: string | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-3">
      {current ? (
        // User-uploaded logo from the media route.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="" className="mb-3 h-16 w-16 rounded-2xl object-cover" />
      ) : (
        <p className="mb-3 text-sm text-stone-500">No logo yet. PNG, JPG, or WebP under 2 MB.</p>
      )}
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError("");
          const body = new FormData();
          body.set("file", file);
          body.set("target", target);
          if (placeId) body.set("placeId", placeId);
          const response = await fetch("/api/uploads/logo", { method: "POST", body });
          const payload = (await response.json()) as { ok: boolean; error?: string };
          setBusy(false);
          if (!payload.ok) {
            setError(payload.error || "Upload failed.");
            return;
          }
          router.refresh();
        }}
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
