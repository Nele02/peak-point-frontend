import type { Category, Peak } from "$lib/types/peak-types";
import type LeafletMap from "$lib/ui/LeafletMap.svelte";

import { curentDataSets, currentCategories, currentPeaks, loggedInUser } from "$lib/runes.svelte";


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

export function computePeaksByCategory(peaks: Peak[], categories: Category[]) {
	curentDataSets.peaksByCategory.labels = [];
	curentDataSets.peaksByCategory.datasets[0].values = [];

	for (const c of categories) {
		curentDataSets.peaksByCategory.labels.push(c.name);
		const count = peaks.filter((p) => categoryIdsOfPeak(p).includes(c._id)).length;
		curentDataSets.peaksByCategory.datasets[0].values.push(count);
	}
}

export function refreshCategoryState(categories: Category[]) {
	currentCategories.categories = categories;
}

export async function refreshPeakState(peaks: Peak[], categories: Category[]) {
	currentPeaks.peaks = peaks;
	currentCategories.categories = categories;
	computePeaksByCategory(currentPeaks.peaks, currentCategories.categories);
}

export function clearPeakState() {
	currentPeaks.peaks = [];
	currentCategories.categories = [];
	curentDataSets.peaksByCategory.labels = [];
	curentDataSets.peaksByCategory.datasets[0].values = [];
	loggedInUser.email = "";
	loggedInUser.name = "";
	loggedInUser.token = "";
	loggedInUser._id = "";
}

function popupOverview(p: Peak): string {
	return `<strong>${p.name}</strong><br/>${p.elevation} m`;
}

function overlayNameForCategory(c: Category): string {
	return c.name;
}

export async function refreshPeakMap(
	map: LeafletMap,
	peaks: Peak[],
	categories: Category[],
	onSelect?: (p: Peak) => void
) {
	const catById = new Map(categories.map((c) => [c._id, c]));

	for (const c of categories) {
		await map.addOverlay(overlayNameForCategory(c));
	}
	await map.addOverlay("Uncategorized");

	for (const p of peaks) {
		const ids = categoryIdsOfPeak(p);

		let overlayName = "Uncategorized";
		if (ids.length > 0) {
			const c = catById.get(ids[0]);
			if (c) overlayName = overlayNameForCategory(c);
		}

		await map.addMarkerToOverlay(overlayName, p.lat, p.lng, popupOverview(p), () => onSelect?.(p));
	}

	const last = peaks[peaks.length - 1];
	if (last) {
		await map.moveTo(last.lat, last.lng, 10);
	}
}
