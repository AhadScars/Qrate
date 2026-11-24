"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteQrAction, adminSetQrActiveAction, adminSetValidityAction } from "@/lib/actions/admin";

export function QrToggle({ qrId, active }: { qrId: string; active: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(active);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          const result = await adminSetQrActiveAction(qrId, !on);
          setPending(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setOn(!on);
          router.refresh();
        }}
        className={`rounded-full px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 ${on ? "bg-red-600" : "bg-emerald-700"}`}
      >
        {pending ? "Saving…" : on ? "Disable QR" : "Enable QR"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function DeleteQrButton({ qrId, label }: { qrId: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          const sure = window.confirm(`Delete ${label} completely? The QR, its scans, and its review page will be removed. This cannot be undone.`);
          if (!sure) return;
          setPending(true);
          setError("");
          const result = await adminDeleteQrAction(qrId);
          setPending(false);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.refresh();
        }}
        className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete QR"}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function ValidityForm({ businessId, endDate }: { businessId: string; endDate: string }) {
  const router = useRouter();
  const [value, setValue] = useState(endDate);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const result = await adminSetValidityAction(businessId, value);
        setPending(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      }}
    >
      <input
        type="date"
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-10 rounded-full border border-stone-200 bg-white px-3 text-sm"
        aria-label="Valid until"
      />
      <button type="submit" disabled={pending} className="h-10 rounded-full bg-indigo-700 px-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Save validity"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
