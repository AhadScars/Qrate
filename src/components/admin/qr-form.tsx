"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateQrAction } from "@/lib/actions/admin";
import { Button, Field, SelectInput, TextArea, TextInput } from "@/components/ui";

export function AdminQrForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setPending(true);
        const formElement = event.currentTarget;
        const form = new FormData(formElement);
        const result = await adminCreateQrAction({
          businessName: String(form.get("businessName") ?? ""),
          placeName: String(form.get("placeName") ?? ""),
          categoryId: String(form.get("categoryId") ?? ""),
          address: String(form.get("address") ?? ""),
          city: String(form.get("city") ?? ""),
          googleReviewUrl: String(form.get("googleReviewUrl") ?? ""),
          welcomeMessage: String(form.get("welcomeMessage") ?? ""),
        });
        setPending(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        formElement.reset();
        router.refresh();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Business name">
          <TextInput name="businessName" required minLength={2} placeholder="Corner Cup" />
        </Field>
        <Field label="Place name" hint="Leave blank to use the business name.">
          <TextInput name="placeName" placeholder="Main branch" />
        </Field>
        <Field label="Category">
          <SelectInput name="categoryId" defaultValue={categories[0]?.id ?? ""}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="City">
          <TextInput name="city" placeholder="Kanpur" />
        </Field>
        <Field label="Address">
          <TextInput name="address" placeholder="12 Mall Road" />
        </Field>
        <Field label="Google Maps link" hint="Paste the share link, like https://maps.app.goo.gl/... Customers still open our page first. Continue to Google opens the review form.">
          <TextInput name="googleReviewUrl" required placeholder="https://maps.app.goo.gl/..." />
        </Field>
      </div>
      <Field label="Welcome line">
        <TextArea name="welcomeMessage" rows={3} placeholder="How was your experience?" />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create QR code"}
      </Button>
    </form>
  );
}
