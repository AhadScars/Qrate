import Link from "next/link";
import { pageHref, pageList } from "@/lib/pagination";

export function Pager({
  page,
  pages,
  total,
  pageSize,
  path,
  params,
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  path: string;
  params?: Record<string, string | undefined>;
}) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const query = params ?? {};
  const items = pageList(page, pages);

  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-stone-500">
        {start}–{end} of {total}
      </p>
      {pages > 1 ? (
        <div className="flex flex-wrap items-center gap-1">
          {page > 1 ? (
            <Link href={pageHref(path, query, page - 1)} className="rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-stone-200">
              Previous
            </Link>
          ) : (
            <span className="rounded-full px-3 py-2 text-sm font-semibold text-stone-400 ring-1 ring-stone-200">Previous</span>
          )}
          {items.map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-sm text-stone-400">
                …
              </span>
            ) : item === page ? (
              <span key={item} aria-current="page" className="rounded-full bg-indigo-700 px-3 py-2 text-sm font-semibold text-white">
                {item}
              </span>
            ) : (
              <Link key={item} href={pageHref(path, query, item)} className="rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-stone-200">
                {item}
              </Link>
            ),
          )}
          {page < pages ? (
            <Link href={pageHref(path, query, page + 1)} className="rounded-full px-3 py-2 text-sm font-semibold ring-1 ring-stone-200">
              Next
            </Link>
          ) : (
            <span className="rounded-full px-3 py-2 text-sm font-semibold text-stone-400 ring-1 ring-stone-200">Next</span>
          )}
        </div>
      ) : null}
    </nav>
  );
}
