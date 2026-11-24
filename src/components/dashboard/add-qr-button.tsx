"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addQrAction } from "@/lib/actions/owner";
import { Button } from "@/components/ui";

export function AddQrButton({ placeId }: { placeId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <div>
      <Button
        variant="soft"
        onClick={async () => {
          const result = await addQrAction(placeId);
          if (!result.ok) setError(result.error);
          else router.refresh();
        }}
      >
        Add another QR
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
