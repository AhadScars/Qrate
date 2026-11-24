import { requireAdmin } from "@/lib/auth/guards";
import { clampPage } from "@/lib/pagination";
import { adminCategoryPage, categoryCount } from "@/repositories/lists";
import { CategoryEditor } from "@/components/admin/category-editor";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Pager } from "@/components/ui/pager";

export const instant = false;

const PAGE_SIZE = 6;

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const total = await categoryCount();
  const { page, pages } = clampPage(params.page, total, PAGE_SIZE);
  const categories = await adminCategoryPage(page, PAGE_SIZE);
  return (
    <div>
      <PageHeader title="Categories" body="Attributes here are the chips a customer can tap. Drafts may only mention the ones they tap." />
      <Card>
        <h2 className="mb-3 font-semibold">New category</h2>
        <CategoryEditor />
      </Card>
      <Pager page={page} pages={pages} total={total} pageSize={PAGE_SIZE} path="/admin/categories" />
      <div className="mt-4 grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-display text-2xl">{category.name}</h2>
              <Badge tone={category.isActive ? "green" : "slate"}>{category.isActive ? "Active" : "Hidden"}</Badge>
              <span className="text-sm text-stone-500">
                {category._count.places} places · {category._count.templates} templates
              </span>
            </div>
            <CategoryEditor
              initial={{
                id: category.id,
                name: category.name,
                description: category.description ?? "",
                icon: category.icon ?? "store",
                welcomeMessage: category.welcomeMessage ?? "",
                isActive: category.isActive,
                attributes: category.attributes
                  .map((attribute) => `${attribute.key} | ${attribute.label} | ${attribute.labelHi} | ${attribute.labelHinglish}`)
                  .join("\n"),
              }}
            />
          </Card>
        ))}
      </div>
      <Pager page={page} pages={pages} total={total} pageSize={PAGE_SIZE} path="/admin/categories" />
    </div>
  );
}
