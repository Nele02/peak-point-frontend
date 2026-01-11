import { describe, expect, it } from "vitest";
import type { Category, Peak } from "$lib/types/peak-types";
import {
  ALL_CATEGORIES,
  barPeaksPerCategory,
  categoryIdByBarIndex,
  filterPeaks,
  pieElevationBands
} from "./chart-utils";

describe("chart-utils", () => {
  const cats: Category[] = [
    { _id: "c1", name: "Alps" } as Category,
    { _id: "c2", name: "Ireland" } as Category
  ];

  const peaks: Peak[] = [
    { _id: "p1", name: "A", elevation: 300, categories: ["c1"], lat: 0, lng: 0 } as unknown as Peak,
    {
      _id: "p2",
      name: "B",
      elevation: 1200,
      categories: ["c1"],
      lat: 0,
      lng: 0
    } as unknown as Peak,
    { _id: "p3", name: "C", elevation: 900, categories: ["c2"], lat: 0, lng: 0 } as unknown as Peak
  ];

  it("filters by min elevation", () => {
    const out = filterPeaks(peaks, { categoryId: ALL_CATEGORIES, minElevation: 1000 });
    expect(out.map((p) => p._id)).toEqual(["p2"]);
  });

  it("filters by category", () => {
    const out = filterPeaks(peaks, { categoryId: "c2", minElevation: 0 });
    expect(out.map((p) => p._id)).toEqual(["p3"]);
  });

  it("builds bar chart dataset", () => {
    const ds = barPeaksPerCategory(peaks, cats);
    expect(ds.labels).toEqual(["Alps", "Ireland"]);
    expect(ds.datasets[0].values).toEqual([2, 1]);
  });

  it("maps bar index to category id", () => {
    expect(categoryIdByBarIndex(cats, 0)).toBe("c1");
    expect(categoryIdByBarIndex(cats, 5)).toBe(null);
  });

  it("builds pie band dataset", () => {
    const ds = pieElevationBands(peaks);
    expect(ds.datasets[0].values.reduce((a, b) => a + b, 0)).toBe(peaks.length);
  });
});
