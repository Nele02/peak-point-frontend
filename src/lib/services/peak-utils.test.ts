import { describe, it, expect } from "vitest";
import { distanceMeters, nearestPeaks } from "./map-utils";
import type { Peak } from "$lib/types/peak-types";

describe("map-utils", () => {
  it("distanceMeters returns ~0 for same point", () => {
    const d = distanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 0 });
    expect(d).toBeLessThan(0.001);
  });

  it("nearestPeaks filters by radius", () => {
    const sel = { _id: "1", name: "A", elevation: 1000, lat: 0, lng: 0, images: [] } as Peak;
    const near = { _id: "2", name: "B", elevation: 900, lat: 0.01, lng: 0, images: [] } as Peak;
    const far = { _id: "3", name: "C", elevation: 800, lat: 2, lng: 0, images: [] } as Peak;

    const res = nearestPeaks([sel, near, far], sel, 3000, 10);
    expect(res.length).toBe(1);
    expect(res[0].peak._id).toBe("2");
  });
});
