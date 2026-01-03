import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PeakList from "./PeakList.svelte";

describe("PeakList", () => {
	it("shows empty message when no peaks exist", () => {
		render(PeakList, { peaks: [] });
		expect(screen.getByTestId("no-peaks")).toBeInTheDocument();
	});

	it("renders peak cards when peaks exist", () => {
		render(PeakList, {
			peaks: [
				{ _id: "p1", name: "Brocken", elevation: 1141, lat: 51.8, lng: 10.6, images: [] },
				{ _id: "p2", name: "Watzmann", elevation: 2713, lat: 47.6, lng: 12.9, images: [] }
			]
		});

		expect(screen.getAllByTestId("peak-card").length).toBe(2);
	});
});
