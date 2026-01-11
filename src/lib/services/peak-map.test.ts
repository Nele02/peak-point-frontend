import { describe, it, expect } from "vitest";
import { peakPopupHtml } from "./peak-map";
import type { Peak, Category } from "$lib/types/peak-types";

describe("peak-map", () => {
  it("peakPopupHtml includes name and elevation", () => {
    const p = { _id: "1", name: "Ben Nevis", elevation: 1345, lat: 0, lng: 0, images: [] } as Peak;
    const html = peakPopupHtml(p, []);
    expect(html).toContain("Ben Nevis");
    expect(html).toContain("1345 m");
  });

  it("peakPopupHtml escapes html", () => {
    const p = { _id: "1", name: "<b>X</b>", elevation: 10, lat: 0, lng: 0, images: [] } as Peak;
    const html = peakPopupHtml(p, []);
    expect(html).toContain("&lt;b&gt;X&lt;/b&gt;");
    expect(html).not.toContain("<b>");
  });

  it("peakPopupHtml resolves category names", () => {
    const categories = [{ _id: "c1", name: "Alps" }] as Category[];
    const p = {
      _id: "1",
      name: "A",
      elevation: 10,
      lat: 0,
      lng: 0,
      images: [],
      categories: ["c1"]
    } as unknown as Peak;

    const html = peakPopupHtml(p, categories);
    expect(html).toContain("Alps");
  });
});
