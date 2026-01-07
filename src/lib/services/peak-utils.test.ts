import { describe, it, expect } from "vitest";
import { computePeaksByCategory } from "./peak-utils";
import { curentDataSets } from "$lib/runes.svelte";
import type { Category, Peak } from "$lib/types/peak-types";

describe("peak-utils", () => {
	it("computePeaksByCategory fills labels and values", () => {
		const categories: Category[] = [
			{ _id: "c1", name: "Alps" },
			{ _id: "c2", name: "Harz" }
		];

		const peaks: Peak[] = [
			{ _id: "p1", name: "A", elevation: 1, lat: 0, lng: 0, categories: ["c1"], images: [] },
			{ _id: "p2", name: "B", elevation: 1, lat: 0, lng: 0, categories: ["c1", "c2"], images: [] }
		];

		computePeaksByCategory(peaks, categories);

		expect(curentDataSets.peaksByCategory.labels).toEqual(["Alps", "Harz"]);
		expect(curentDataSets.peaksByCategory.datasets[0].values).toEqual([2, 1]);
	});
});
