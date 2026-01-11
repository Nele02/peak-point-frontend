import { describe, it, expect } from "vitest";
import { toPeakPayload } from "./peak-payload";
import type { Peak } from "$lib/types/peak-types";

describe("toPeakPayload", () => {
  it("does not include _id and maps category objects to ids", () => {
    const peak: Peak = {
      _id: "p1",
      name: "Test",
      elevation: 10,
      lat: 1,
      lng: 2,
      categories: [{ _id: "c1", name: "A" }],
      images: [{ url: "u", publicId: "pid" }]
    };

    const payload = toPeakPayload(peak);

    expect("_id" in (payload as unknown as object)).toBe(false);
    expect(payload.categories).toEqual(["c1"]);
  });
});
