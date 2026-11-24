"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminActivateAction,
  adminArchiveBusinessAction,
  adminDisableTrialAction,
  adminExtendAction,
  adminSuspendAction,
  adminUnsuspendAction,
  adminUpdateBusinessAction,
} from "@/lib/actions/admin";
import { Button, Field, TextInput } from "@/components/ui";

export function BusinessControls({
  businessId,
  name,
  phone,
}: {
  businessId: string;
  name: string;
  phone: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function run(task: () => Promise<{ ok: boolean; error?: string }>, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    setError("");
    setMessage("");
    const result = await task();
    if (!result.ok) setError(result.error || "That did not work.");
    else {
      setMessage("Saved.");
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void run(() =>
            adminUpdateBusinessAction({
              businessId,
              name: String(form.get("name") ?? ""),
              phone: String(form.get("phone") ?? ""),
            }),
          );
        }}
      >
        <Field label="Business name">
          <TextInput name="name" defaultValue={name} />
        </Field>
        <Field label="Phone">
          <TextInput name="phone" defaultValue={phone} />
        </Field>
        <Button type="submit">Save details</Button>
      </form>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void run(() => adminActivateAction({ businessId, reference: String(form.get("reference") ?? "") }));
        }}
      >
        <Field label="Payment reference">
          <TextInput name="reference" placeholder="UTR or receipt" />
        </Field>
        <Button type="submit">Activate paid plan</Button>
      </form>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void run(() => adminExtendAction({ businessId, days: String(form.get("days") ?? "") }));
        }}
      >
        <Field label="Extend by days">
          <TextInput name="days" type="number" min={1} defaultValue={7} />
        </Field>
        <Button type="submit" variant="soft">
          Extend
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => void run(() => adminSuspendAction(businessId), "Suspend this business?")}>
          Suspend
        </Button>
        <Button variant="ghost" onClick={() => void run(() => adminUnsuspendAction(businessId))}>
          Unsuspend
        </Button>
        <Button variant="ghost" onClick={() => void run(() => adminDisableTrialAction(businessId), "Turn off the trial?")}>
          Disable trial
        </Button>
        <Button variant="danger" onClick={() => void run(() => adminArchiveBusinessAction(businessId), "Archive this business and stop its QR codes?")}>
          Delete safely
        </Button>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
