"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminArchivePlaceAction, adminDeleteTemplateAction, adminMarkPaymentAction } from "@/lib/actions/admin";

export function ArchiveAdminPlace({ placeId }: { placeId: string }) {
  const router = useRouter();
  return (
    <button
      className="text-sm font-semibold text-red-600"
      onClick={async () => {
        if (!confirm("Archive this location?")) return;
        await adminArchivePlaceAction(placeId);
        router.refresh();
      }}
    >
      Archive
    </button>
  );
}

export function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await adminMarkPaymentAction(paymentId, String(form.get("reference") ?? ""));
        if (!result.ok) setError(result.error);
        else router.refresh();
      }}
    >
      <input name="reference" placeholder="Reference" className="h-9 rounded-full border border-stone-200 px-3 text-xs" />
      <button className="text-sm font-semibold text-indigo-700">Mark paid</button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </form>
  );
}

export function DeleteTemplateButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  return (
    <button
      className="text-sm font-semibold text-red-600"
      onClick={async () => {
        if (!confirm("Delete this template?")) return;
        await adminDeleteTemplateAction(templateId);
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}
