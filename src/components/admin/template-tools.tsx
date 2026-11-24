"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminImportTemplatesAction, adminSaveTemplateAction } from "@/lib/actions/admin";
import { Button, Field, SelectInput, TextArea } from "@/components/ui";

export function TemplateForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const result = await adminSaveTemplateAction({
          categoryId: String(form.get("categoryId") ?? ""),
          language: String(form.get("language") ?? "en"),
          tone: String(form.get("tone") ?? "natural"),
          length: String(form.get("length") ?? "medium"),
          ratingBand: String(form.get("ratingBand") ?? "high"),
          content: String(form.get("content") ?? ""),
          isActive: form.get("isActive") === "on",
        });
        if (!result.ok) setError(result.error);
        else {
          setError("");
          router.refresh();
        }
      }}
    >
      <Field label="Category">
        <SelectInput name="categoryId">
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Language">
        <SelectInput name="language">
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </SelectInput>
      </Field>
      <Field label="Tone">
        <SelectInput name="tone">
          <option value="natural">Natural</option>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="simple">Simple</option>
        </SelectInput>
      </Field>
      <Field label="Length">
        <SelectInput name="length">
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="detailed">Detailed</option>
        </SelectInput>
      </Field>
      <Field label="Rating band">
        <SelectInput name="ratingBand">
          <option value="high">High, 4 to 5</option>
          <option value="mid">Mid, 3</option>
          <option value="low">Low, 1 to 2</option>
        </SelectInput>
      </Field>
      <div className="md:col-span-2">
        <Field label="Pattern" hint="Use {business}, {rating}, {rating_phrase}, {attributes}, and {category}. Do not invent a visit.">
          <TextArea name="content" rows={4} defaultValue="I visited {business}. I give it {rating} out of 5. The visit felt {rating_phrase}. I am only talking about {attributes}." />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked /> Active
      </label>
      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
      <Button type="submit">Save template</Button>
    </form>
  );
}

export function ImportTemplates() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const file = form.get("file");
        if (!(file instanceof File)) return;
        const result = await adminImportTemplatesAction(await file.text());
        if (!result.ok) setError(result.error);
        else {
          setError("");
          setMessage(`Imported ${result.count} templates.`);
          router.refresh();
        }
      }}
    >
      <input name="file" type="file" accept=".csv,text/csv" />
      <p className="text-xs text-stone-500">Header: categorySlug,language,tone,length,ratingBand,content,isActive</p>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="ghost">
        Import CSV
      </Button>
    </form>
  );
}
