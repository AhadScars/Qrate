"use client";

import { useState } from "react";
import { adminSaveSettingsAction } from "@/lib/actions/admin";
import { Button, Field, TextArea, TextInput } from "@/components/ui";

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await adminSaveSettingsAction(Object.fromEntries(form.entries()));
        if (!result.ok) setError(result.error);
        else {
          setError("");
          setMessage("Settings saved.");
        }
      }}
    >
      {Object.entries(values).map(([key, value]) => (
        <Field key={key} label={key}>
          {key === "terms" || key === "privacy" ? (
            <TextArea name={key} rows={5} defaultValue={value} />
          ) : (
            <TextInput name={key} defaultValue={value} />
          )}
        </Field>
      ))}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit">Save settings</Button>
    </form>
  );
}
