import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { clampPage } from "@/lib/pagination";
import { adminCategories, adminTemplates, templateCount } from "@/repositories/lists";
import { DeleteTemplateButton } from "@/components/admin/small-actions";
import { ImportTemplates, TemplateForm } from "@/components/admin/template-tools";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { Pager } from "@/components/ui/pager";
import { TEMPLATE_CAP } from "@/services/reviews/patterns";

export const instant = false;

const PAGE_SIZE = 20;

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; language?: string; q?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const filters = { categoryId: params.categoryId, language: params.language, q: params.q };
  const [categories, stored, matched] = await Promise.all([adminCategories(), templateCount(), templateCount(filters)]);
  const { page, pages } = clampPage(params.page, matched, PAGE_SIZE);
  const templates = await adminTemplates(filters, page, PAGE_SIZE);
  return (
    <div>
      <PageHeader
        title="Review templates"
        body={`${stored} stored patterns, capped at ${TEMPLATE_CAP.toLocaleString("en-IN")}.`}
        action={
          <Link href="/api/admin/templates/export" className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-stone-200">
            Export CSV
          </Link>
        }
      />
      <Card>
        <TemplateForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
      </Card>
      <Card className="mt-4">
        <h2 className="mb-3 font-semibold">Import</h2>
        <ImportTemplates />
      </Card>
      <form className="my-4 flex flex-wrap gap-2">
        <select name="categoryId" defaultValue={params.categoryId ?? ""} className="h-11 rounded-full border border-stone-200 bg-white px-3 text-sm">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="language" defaultValue={params.language ?? ""} className="h-11 rounded-full border border-stone-200 bg-white px-3 text-sm">
          <option value="">All languages</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="hinglish">Hinglish</option>
        </select>
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search text" className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm" />
        <button className="rounded-full bg-indigo-700 px-4 text-sm font-semibold text-white">Filter</button>
      </form>
      <Pager
        page={page}
        pages={pages}
        total={matched}
        pageSize={PAGE_SIZE}
        path="/admin/review-templates"
        params={{ categoryId: params.categoryId, language: params.language, q: params.q }}
      />
      {templates.length === 0 ? <EmptyState title="No templates on this filter" body="Clear the filter or add a pattern above." /> : null}
      <div className="mt-4 grid gap-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge>{template.category.name}</Badge>
              <Badge tone="indigo">{template.language}</Badge>
              <Badge tone="slate">{template.tone}</Badge>
              <Badge tone="slate">{template.length}</Badge>
              <Badge tone="amber">{template.ratingBand}</Badge>
              <Badge tone={template.isActive ? "green" : "red"}>{template.isActive ? "Active" : "Off"}</Badge>
              <DeleteTemplateButton templateId={template.id} />
            </div>
            <p className="mt-3 text-sm leading-6">{template.content}</p>
          </Card>
        ))}
      </div>
      <Pager
        page={page}
        pages={pages}
        total={matched}
        pageSize={PAGE_SIZE}
        path="/admin/review-templates"
        params={{ categoryId: params.categoryId, language: params.language, q: params.q }}
      />
    </div>
  );
}
