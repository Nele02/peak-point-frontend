import type { Peak, Category } from "$lib/types/peak-types";

export const UNCATEGORIZED = "__none__";

export function categoryIdsOfPeak(p: Peak): string[] {
  const cats = (p as unknown as { categories?: unknown }).categories;
  if (!cats) return [];

  if (Array.isArray(cats) && cats.every((c) => typeof c === "string")) return cats as string[];

  if (
    Array.isArray(cats) &&
    cats.every(
      (c) => typeof c === "object" && c !== null && "_id" in (c as Record<string, unknown>)
    )
  ) {
    return (cats as { _id: string }[]).map((c) => c._id);
  }

  return [];
}

export function peaksForCategory(peaks: Peak[], categoryId: string): Peak[] {
  if (categoryId === UNCATEGORIZED) {
    return peaks.filter((p) => categoryIdsOfPeak(p).length === 0);
  }
  return peaks.filter((p) => categoryIdsOfPeak(p).includes(categoryId));
}

export function overlayNameForCategory(c: Category) {
  return c.name;
}
