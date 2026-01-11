import type { Category, Peak } from "$lib/types/peak-types";

function categoryIdsOfPeak(p: Peak): string[] {
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

export function filterPeaks(peaks: Peak[], categoryIds: string[], minElevation: number) {
  return peaks.filter((p) => {
    if (typeof p.elevation === "number" && p.elevation < minElevation) return false;
    if (categoryIds.length === 0) return true;

    const ids = categoryIdsOfPeak(p);
    // matches if peak is in ANY selected category
    return categoryIds.some((cid) => ids.includes(cid));
  });
}

export function computePeaksPerCategory(peaks: Peak[], categories: Category[]) {
  return {
    labels: categories.map((c) => c.name),
    datasets: [
      {
        values: categories.map(
          (c) => peaks.filter((p) => categoryIdsOfPeak(p).includes(c._id)).length
        )
      }
    ]
  };
}

export function computeElevationBands(peaks: Peak[]) {
  const bands = [
    { name: "< 500m", min: -Infinity, max: 499 },
    { name: "500–999m", min: 500, max: 999 },
    { name: "1000–1499m", min: 1000, max: 1499 },
    { name: "1500–1999m", min: 1500, max: 1999 },
    { name: "2000m+", min: 2000, max: Infinity }
  ];

  return {
    labels: bands.map((b) => b.name),
    datasets: [
      {
        values: bands.map(
          (b) =>
            peaks.filter(
              (p) => typeof p.elevation === "number" && p.elevation >= b.min && p.elevation <= b.max
            ).length
        )
      }
    ]
  };
}

export function computeElevationLine(peaks: Peak[]) {
  const sorted = [...peaks].sort((a, b) => (a.elevation ?? 0) - (b.elevation ?? 0));
  return {
    labels: sorted.map((p) => p.name),
    datasets: [{ values: sorted.map((p) => p.elevation ?? 0) }]
  };
}
