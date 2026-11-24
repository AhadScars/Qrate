export function clampPage(raw: string | undefined, total: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const parsed = Number(raw);
  const requested = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  return { page: Math.min(requested, pages), pages };
}

export function pageList(current: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const wanted = [1, totalPages, current - 1, current, current + 1].filter((page) => page >= 1 && page <= totalPages);
  const unique = [...new Set(wanted)].sort((left, right) => left - right);
  const items: Array<number | "gap"> = [];
  for (const page of unique) {
    const previous = items[items.length - 1];
    if (typeof previous === "number" && page - previous > 1) items.push("gap");
    items.push(page);
  }
  return items;
}

export function pageHref(path: string, params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || !value) continue;
    query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}
