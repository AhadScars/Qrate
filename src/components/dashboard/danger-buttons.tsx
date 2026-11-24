"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { archivePlaceAction, regenerateQrAction, setQrActiveAction } from "@/lib/actions/owner";
import { Button } from "@/components/ui";

export function ArchivePlaceButton({ placeId }: { placeId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="danger"
        onClick={async () => {
          if (!confirm("Archive this location? Its QR codes will stop opening.")) return;
          const result = await archivePlaceAction(placeId);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push("/dashboard/places");
          router.refresh();
        }}
      >
        Archive location
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function QrActiveButton({ qrId, isActive }: { qrId: string; isActive: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="ghost"
        onClick={async () => {
          const next = !isActive;
          if (!confirm(next ? "Turn this QR code back on?" : "Turn this QR code off? Printed copies will stop opening.")) return;
          const result = await setQrActiveAction(qrId, next);
          if (!result.ok) setError(result.error);
          else router.refresh();
        }}
      >
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function RegenerateButton({ qrId }: { qrId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="soft"
        onClick={async () => {
          if (!confirm("Create a new QR code? The current one keeps working until you deactivate it.")) return;
          const result = await regenerateQrAction(qrId);
          if (!result.ok) setError(result.error);
          else router.refresh();
        }}
      >
        Regenerate
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
