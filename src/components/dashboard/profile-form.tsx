"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { saveProfileAction } from "@/lib/actions/owner";
import { Button, Field, TextInput } from "@/components/ui";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const form = useForm({ defaultValues: { name, phone } });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        setMessage("");
        const result = await saveProfileAction(values);
        if (!result.ok) setError(result.error);
        else setMessage("Saved.");
      })}
    >
      <Field label="Business name">
        <TextInput {...form.register("name")} />
      </Field>
      <Field label="Phone">
        <TextInput {...form.register("phone")} />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit">Save profile</Button>
    </form>
  );
}
