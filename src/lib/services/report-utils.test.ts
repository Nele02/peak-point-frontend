import { describe, it, expect } from "vitest";
import type { Category, Peak } from "$lib/types/peak-types";
import {
  filterPeaks,
  computePeaksPerCategory,
  computeElevationBands,
  computeElevationLine
} from "./report-utils";

function peak(partial: Partial<Peak> & { _id: string; name: string; elevation: number }): Peak {
  return {
    _id: partial._id,
    name: partial.name,
    elevation: partial.elevation,
    description: "",
    lat: 0,
    lng: 0,
    categories: partial.categories ?? [],
    images: []
  } as Peak;
}

describe("report-utils", () => {
  const categories: Category[] = [
    { _id: "c1", name: "Alps" },
    { _id: "c2", name: "Harz" }
  ];

  const peaks: Peak[] = [
    peak({ _id: "p1", name: "Low", elevation: 400, categories: ["c2"] }),
    peak({ _id: "p2", name: "Mid", elevation: 1100, categories: ["c2"] }),
    peak({ _id: "p3", name: "High", elevation: 2100, categories: ["c1"] }),
    peak({ _id: "p4", name: "NoCat", elevation: 800, categories: [] })
  ];

  it("filterPeaks filters by minimum elevation", () => {
    const res = filterPeaks(peaks, [], 1000);
    expect(res.map((p) => p._id)).toEqual(["p2", "p3"]);
  });

  it("filterPeaks filters by categories (OR logic)", () => {
    const res = filterPeaks(peaks, ["c1", "c2"], 0);
    expect(res.map((p) => p._id)).toEqual(["p1", "p2", "p3"]);
  });

  it("computePeaksPerCategory returns correct counts and aligned labels/values", () => {
    const ds = computePeaksPerCategory(peaks, categories);
    expect(ds.labels).toEqual(["Alps", "Harz"]);
    expect(ds.datasets[0].values).toEqual([1, 2]);

    expect(ds.labels.length).toBe(ds.datasets[0].values.length);
  });

  it("computeElevationBands returns 5 bands and correct 2000m+ count", () => {
    const pie = computeElevationBands(peaks);
    expect(pie.labels.length).toBe(5);
    expect(pie.datasets[0].values.length).toBe(5);

    const lastLabel = pie.labels[4];
    expect(lastLabel).toMatch(/2000/);

    const lastValue = pie.datasets[0].values[4];
    expect(lastValue).toBe(1);
  });

  it("computeElevationLine sorts by elevation ascending", () => {
    const line = computeElevationLine(peaks);
    expect(line.labels[0]).toBe("Low");
    expect(line.labels[line.labels.length - 1]).toBe("High");

    const values = line.datasets[0].values;
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});
