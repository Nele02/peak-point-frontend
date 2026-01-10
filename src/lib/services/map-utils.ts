import type { Peak } from "$lib/types/peak-types";

export function popupOverview(p: Peak): string {
	return `<strong>${p.name}</strong><br/>${p.elevation} m`;
}

export function popupFocus(p: Peak): string {
	const desc = p.description ? `<br/><span>${p.description}</span>` : "";
	return `<strong>${p.name}</strong><br/>${p.elevation} m${desc}`;
}

function toRad(x: number) {
	return (x * Math.PI) / 180;
}

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
	const R = 6371000;
	const dLat = toRad(b.lat - a.lat);
	const dLon = toRad(b.lng - a.lng);

	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);

	const s =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

	return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function nearestPeaks(all: Peak[], selected: Peak, radiusMeters = 10000, max = 50) {
	const origin = { lat: selected.lat, lng: selected.lng };

	const candidates = all
		.filter((p) => p._id !== selected._id)
		.map((p) => ({
			peak: p,
			d: distanceMeters(origin, { lat: p.lat, lng: p.lng })
		}))
		.filter((x) => Number.isFinite(x.d) && x.d <= radiusMeters)
		.sort((a, b) => a.d - b.d)
		.slice(0, max);

	return candidates;
}

export function popupNearby(p: Peak, distanceM: number): string {
	const km = (distanceM / 1000).toFixed(2);
	return `<strong>${p.name}</strong><br/>${p.elevation} m<br/>${km} km away`;
}
