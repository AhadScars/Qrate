import { describe, expect, it } from "vitest";
import { clampPage, pageHref, pageList } from "@/lib/pagination";

describe("pagination", () => {
  it("clamps a missing or huge page onto the real last page", () => {
    expect(clampPage(undefined, 0, 20)).toEqual({ page: 1, pages: 1 });
    expect(clampPage("4", 45, 20)).toEqual({ page: 3, pages: 3 });
    expect(clampPage("0", 45, 20)).toEqual({ page: 1, pages: 3 });
  });

  it("collapses a long page list around the current page", () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
    expect(pageList(10, 40)).toEqual([1, "gap", 9, 10, 11, "gap", 40]);
  });

  it("keeps filters in the page link and drops page 1", () => {
    expect(pageHref("/admin/review-templates", { language: "en", q: "coffee", page: "4" }, 1)).toBe(
      "/admin/review-templates?language=en&q=coffee",
    );
    expect(pageHref("/admin/categories", {}, 2)).toBe("/admin/categories?page=2");
  });
});
