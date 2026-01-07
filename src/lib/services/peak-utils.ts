import { curentDataSets, currentCategories, currentPeaks, loggedInUser } from "$lib/runes.svelte";
import type { Category, Peak } from "$lib/types/peak-types";
import type LeafletMap from "$lib/ui/LeafletMap.svelte";
import { peakService } from "./peak-service";

function normalizeCategoryIds(categories: Peak["categories"]): string[] {
	if (!categories) return [];

	if (Array.isArray(categories) && categories.every((c) => typeof c === "string")) {
		return categories as string[];
	}

	if (
		Array.isArray(categories) &&
		categories.every((c) => typeof c === "object" && c !== null && "_id" in c)
	) {
		return (categories as { _id: string }[]).map((c) => c._id);
	}

	return [];
}

export function computePeaksByCategory(peaks: Peak[], categories: Category[]) {
	curentDataSets.peaksByCategory.labels = [];
	curentDataSets.peaksByCategory.datasets[0].values = [];

	categories.forEach((c) => {
		curentDataSets.peaksByCategory.labels.push(c.name);
		curentDataSets.peaksByCategory.datasets[0].values.push(0);
	});

	categories.forEach((c, i) => {
		peaks.forEach((p) => {
			const ids = normalizeCategoryIds(p.categories);
			if (ids.includes(c._id)) {
				curentDataSets.peaksByCategory.datasets[0].values[i] += 1;
			}
		});
	});
}

export async function refreshPeakMap(map: LeafletMap) {
	const categories = await peakService.getAllCategories();
	const peaks = await peakService.getUserPeaks(loggedInUser._id, {});

	for (const c of categories) {
		await map.addOverlay(c.name);
	}
	await map.addOverlay("Uncategorized");

	peaks.forEach((p: Peak) => {
		const popup = `<strong>${p.name}</strong><br/>${p.elevation} m`;
		const ids = normalizeCategoryIds(p.categories);

		if (ids.length === 0) {
			map.addMarkerToOverlay("Uncategorized", p.lat, p.lng, popup);
			return;
		}

		ids.forEach((cid) => {
			const cat = categories.find((x) => x._id === cid);
			if (cat) map.addMarkerToOverlay(cat.name, p.lat, p.lng, popup);
		});
	});

	const last = peaks[peaks.length - 1];
	if (last) await map.moveTo(last.lat, last.lng);
}

export function clearPeakState() {
	currentPeaks.peaks = [];
	currentCategories.categories = [];
	loggedInUser.email = "";
	loggedInUser.name = "";
	loggedInUser.token = "";
	loggedInUser._id = "";
}

export async function refreshPeakState(peaks: Peak[], categories: Category[]) {
	currentPeaks.peaks = peaks;
	currentCategories.categories = categories;
	computePeaksByCategory(currentPeaks.peaks, currentCategories.categories);
}
