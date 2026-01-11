import type { Category, Peak } from "$lib/types/peak-types";

export type PeakCategoryId = string;
export const ALL_CATEGORIES = "__all__";

export function categoryIdsOfPeak(p: Peak): string[] {
	const cats = (p as unknown as { categories?: unknown }).categories;
	if (!cats) return [];

	if (Array.isArray(cats) && cats.every((c) => typeof c === "string")) return cats as string[];

	if (
		Array.isArray(cats) &&
		cats.every((c) => typeof c === "object" && c !== null && "_id" in (c as Record<string, unknown>))
	) {
		return (cats as { _id: string }[]).map((c) => c._id);
	}

	return [];
}

export function filterPeaks(peaks: Peak[], opts: { categoryId: string; minElevation: number }) {
	const { categoryId, minElevation } = opts;

	return peaks.filter((p) => {
		if (typeof p.elevation === "number" && p.elevation < minElevation) return false;

		if (categoryId === ALL_CATEGORIES) return true;

		const ids = categoryIdsOfPeak(p);
		return ids.includes(categoryId);
	});
}

export function barPeaksPerCategory(peaks: Peak[], categories: Category[]) {
	const labels = categories.map((c) => c.name);
	const values = categories.map((c) => peaks.filter((p) => categoryIdsOfPeak(p).includes(c._id)).length);

	return {
		labels,
		datasets: [{ name: "Peaks", values }]
	};
}

export function pieElevationBands(peaks: Peak[]) {
	const bands = [
		{ name: "< 500m", min: -Infinity, max: 499 },
		{ name: "500–999m", min: 500, max: 999 },
		{ name: "1000–1499m", min: 1000, max: 1499 },
		{ name: "1500–1999m", min: 1500, max: 1999 },
		{ name: "2000m+", min: 2000, max: Infinity }
	];

	const labels = bands.map((b) => b.name);
	const values = bands.map(
		(b) => peaks.filter((p) => typeof p.elevation === "number" && p.elevation >= b.min && p.elevation <= b.max).length
	);

	return {
		labels,
		datasets: [{ name: "Peaks", values }]
	};
}

export function lineElevationTrend(peaks: Peak[]) {
	const sorted = [...peaks].sort((a, b) => (a.elevation ?? 0) - (b.elevation ?? 0));
	const labels = sorted.map((p) => p.name);
	const values = sorted.map((p) => p.elevation ?? 0);

	return {
		labels,
		datasets: [{ name: "Elevation (m)", values }]
	};
}

export function categoryIdByBarIndex(categories: Category[], index: number): string | null {
	if (!Number.isFinite(index) || index < 0 || index >= categories.length) return null;
	return categories[index]?._id ?? null;
}