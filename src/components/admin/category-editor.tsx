"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminArchiveCategoryAction, adminSaveCategoryAction } from "@/lib/actions/admin";
import { Button, Field, TextArea, TextInput } from "@/components/ui";

export function CategoryEditor({
  initial,
}: {
  initial?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    welcomeMessage: string;
    isActive: boolean;
    attributes: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <form
      className="grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const attributes = String(form.get("attributes") ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [key, label, labelHi, labelHinglish] = line.split("|").map((part) => part.trim());
            return { key: key || "", label: label || "", labelHi: labelHi || label || "", labelHinglish: labelHinglish || label || "" };
          });
        const result = await adminSaveCategoryAction({
          id: initial?.id ?? "",
          name: String(form.get("name") ?? ""),
          description: String(form.get("description") ?? ""),
          icon: String(form.get("icon") ?? ""),
          welcomeMessage: String(form.get("welcome") ?? ""),
          isActive: form.get("isActive") === "on",
          attributes,
        });
        if (!result.ok) setError(result.error);
        else {
          setError("");
          router.refresh();
        }
      }}
    >
      <Field label="Name">
        <TextInput name="name" defaultValue={initial?.name ?? ""} required />
      </Field>
      <Field label="Description">
        <TextInput name="description" defaultValue={initial?.description ?? ""} />
      </Field>
      <Field label="Icon name" hint="utensils, coffee, hotel, dumbbell, scissors, store, shirt, stethoscope, smile, sparkles, wrench, map-pin">
        <TextInput name="icon" defaultValue={initial?.icon ?? "store"} />
      </Field>
      <Field label="Welcome message">
        <TextInput name="welcome" defaultValue={initial?.welcomeMessage ?? ""} />
      </Field>
      <Field label="Attributes" hint="One per line: key | English | Hindi | Hinglish">
        <TextArea name="attributes" rows={6} defaultValue={initial?.attributes ?? "service-quality | Service quality | सर्विस क्वालिटी | service quality"} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={initial?.isActive ?? true} /> Active
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit">{initial ? "Update category" : "Add category"}</Button>
        {initial ? (
          <Button
            type="button"
            variant="danger"
            onClick={async () => {
              if (!confirm("Hide this category?")) return;
              const result = await adminArchiveCategoryAction(initial.id);
              if (!result.ok) setError(result.error);
              else router.refresh();
            }}
          >
            Hide
          </Button>
        ) : null}
      </div>
    </form>
  );
}
