import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PeakSelectionList from "./PeakSelectionList.svelte";
import type { Category, Peak } from "$lib/types/peak-types";

describe("PeakSelectionList", () => {
	it("calls onSelect when a peak is clicked", async () => {
		const categories: Category[] = [{ _id: "c1", name: "Alps" }];

		const peaks: Peak[] = [
			{ _id: "p1", name: "Zugspitze", elevation: 2962, lat: 1, lng: 2, categories: ["c1"], images: [] }
		];

		const onSelect = vi.fn();

		render(PeakSelectionList, {
			categories,
			peaks,
			onSelect,
			selectedId: ""
		});

		const catRow = screen.getByText("Alps");
		await fireEvent.click(catRow);

		const peakRow = screen.getByText("Zugspitze");
		await fireEvent.click(peakRow);

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ _id: "p1" }));
	});
});
