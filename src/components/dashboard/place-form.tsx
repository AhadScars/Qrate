"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { savePlaceAction } from "@/lib/actions/owner";
import { Button, Field, SelectInput, TextArea, TextInput } from "@/components/ui";

type Category = { id: string; name: string };
type Values = {
  name: string;
  categoryId: string;
  address: string;
  city: string;
  googleBusinessName: string;
  googleMapsUrl: string;
  googleReviewUrl: string;
  welcomeMessage: string;
};

export function PlaceForm({
  categories,
  placeId,
  initial,
}: {
  categories: Category[];
  placeId?: string;
  initial?: Partial<Values>;
}) {
  const router = useRouter();
  const form = useForm<Values>({
    defaultValues: {
      name: initial?.name ?? "",
      categoryId: initial?.categoryId ?? categories[0]?.id ?? "",
      address: initial?.address ?? "",
      city: initial?.city ?? "",
      googleBusinessName: initial?.googleBusinessName ?? "",
      googleMapsUrl: initial?.googleMapsUrl ?? "",
      googleReviewUrl: initial?.googleReviewUrl ?? "",
      welcomeMessage: initial?.welcomeMessage ?? "",
    },
  });
  const [error, setError] = useState("");

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const result = await savePlaceAction({ ...values, placeId });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(`/dashboard/places/${result.placeId}`);
        router.refresh();
      })}
    >
      <Field label="Location name">
        <TextInput {...form.register("name")} />
      </Field>
      <Field label="Category">
        <SelectInput {...form.register("categoryId")}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Address">
        <TextInput {...form.register("address")} />
      </Field>
      <Field label="City">
        <TextInput {...form.register("city")} />
      </Field>
      <Field label="Google Business Profile name">
        <TextInput {...form.register("googleBusinessName")} />
      </Field>
      <Field label="Google Maps URL">
        <TextInput placeholder="https://" {...form.register("googleMapsUrl")} />
      </Field>
      <Field label="Google review URL" hint="The link that opens the write-a-review screen.">
        <TextInput placeholder="https://" {...form.register("googleReviewUrl")} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Welcome line" hint="Leave blank to use the category default.">
          <TextArea rows={3} {...form.register("welcomeMessage")} />
        </Field>
      </div>
      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save location"}
        </Button>
      </div>
    </form>
  );
}
