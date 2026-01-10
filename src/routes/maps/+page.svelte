<script lang="ts">
	import Card from "$lib/ui/Card.svelte";
	import LeafletMap from "$lib/ui/LeafletMap.svelte";
	import PeakSelectionList from "$lib/ui/PeakSelectionList.svelte";

	import type { Peak } from "$lib/types/peak-types";
	import type { PageProps } from "./$types";

	import { currentCategories, currentPeaks, subTitle } from "$lib/runes.svelte";
	import { refreshPeakState } from "$lib/services/peak-utils";

	import { nearestPeaks, popupFocus } from "$lib/services/map-utils";
	import { peaksForCategory, UNCATEGORIZED, overlayNameForCategory } from "$lib/services/peak-layers";

	subTitle.text = "Maps";

	let { data }: PageProps = $props();

	// Donation-style: immediately push SSR data into runes state
	refreshPeakState(data.peaks ?? [], data.categories ?? []);

	let selected = $state<Peak | null>(null);
	let radiusKm = $state(10);

	const radiusInputId = "nearby-radius";

	let mapOverview: LeafletMap;
	let mapFocus: LeafletMap;
	let mapNearby: LeafletMap;

	let readyOverview = $state(false);
	let readyFocus = $state(false);
	let readyNearby = $state(false);

	let overviewBuilt = $state(false);
	let initialized = $state(false);

	const OVERVIEW_HEIGHT_VH = 58;
	const BOTTOM_HEIGHT_VH = 44;

	type MarkerLike = { openPopup?: () => void };

		let markerById = $state(new Map<string, MarkerLike>());

	function popupNameOnly(p: Peak) {
		return `<strong>${p.name}</strong>`;
	}

	function openOverviewPopupById(id: string | undefined) {
		if (!id) return;
		markerById.get(id)?.openPopup?.();
	}

	function radiusBoundsPoints(center: { lat: number; lng: number }, radiusMeters: number) {
		const R = 6371000;
		const latRad = (center.lat * Math.PI) / 180;

		const dLat = (radiusMeters / R) * (180 / Math.PI);
		const dLng = (radiusMeters / (R * Math.cos(latRad))) * (180 / Math.PI);

		return [
			{ lat: center.lat + dLat, lng: center.lng },
			{ lat: center.lat - dLat, lng: center.lng },
			{ lat: center.lat, lng: center.lng + dLng },
			{ lat: center.lat, lng: center.lng - dLng }
		];
	}

	async function buildOverviewOnce() {
		if (!readyOverview || overviewBuilt) return;

		markerById.clear();
		await mapOverview.clearOverlays();
		await mapOverview.clearMarkers();

		const categories = currentCategories.categories;
		const peaks = currentPeaks.peaks;

		for (const c of categories) {
			const overlayName = overlayNameForCategory(c);
			const ps = peaksForCategory(peaks, c._id);
			if (ps.length === 0) continue;

			for (const p of ps) {
				if (!p._id) continue;

				const marker = (await mapOverview.addMarkerToOverlay(
					overlayName,
					p.lat,
					p.lng,
					popupNameOnly(p),
					() => applySelection(p, "map")
				)) as unknown as MarkerLike;

				markerById.set(p._id, marker);
			}
		}

		const unc = peaksForCategory(peaks, UNCATEGORIZED);
		for (const p of unc) {
			if (!p._id) continue;

			const marker = (await mapOverview.addMarkerToOverlay(
				"Uncategorized",
				p.lat,
				p.lng,
				popupNameOnly(p),
				() => applySelection(p, "map")
			)) as unknown as MarkerLike;

			markerById.set(p._id, marker);
		}

		if (peaks.length > 0) {
			await mapOverview.fitToPoints(peaks.map((p) => ({ lat: p.lat, lng: p.lng })), 40);
		}

		overviewBuilt = true;
	}

	// map moves dependent on source of selection

	async function updateOverviewView(p: Peak, source: "list" | "map" | "init") {
		if (!p._id) return;
		await buildOverviewOnce();

		if (source === "list" || source === "init") {
			await mapOverview.moveTo(p.lat, p.lng, 13);
		}
		openOverviewPopupById(p._id);
	}

	async function updateFocusView(p: Peak) {
		await mapFocus.clearOverlays();
		await mapFocus.clearMarkers();

		await mapFocus.addMarker(p.lat, p.lng, popupFocus(p));
		await mapFocus.addCircle(p.lat, p.lng, radiusKm * 1000);

		await mapFocus.moveTo(p.lat, p.lng, 12);
	}

	async function updateNearbyView(p: Peak) {
		await mapNearby.clearOverlays();
		await mapNearby.clearMarkers();

		const radiusM = radiusKm * 1000;
		const peaks = currentPeaks.peaks;

		const results = nearestPeaks(peaks, p, radiusM, 120);

		const selectedMarker = (await mapNearby.addMarker(p.lat, p.lng, popupNameOnly(p))) as unknown as MarkerLike;
		selectedMarker.openPopup?.();

		for (const r of results) {
			await mapNearby.addMarker(r.peak.lat, r.peak.lng, popupNameOnly(r.peak));
		}

		// zoom based on radius
		const points = [
			{ lat: p.lat, lng: p.lng },
			...results.map((r) => ({ lat: r.peak.lat, lng: r.peak.lng })),
			...radiusBoundsPoints({ lat: p.lat, lng: p.lng }, radiusM)
		];

		await mapNearby.fitToPoints(points, 35);
	}

	// selection entry point

	async function applySelection(p: Peak, source: "list" | "map" | "init") {
		if (!p._id) return;

		selected = p;

		// sync updates
		const tasks: Array<Promise<void>> = [];

		if (readyOverview) tasks.push(updateOverviewView(p, source));
		if (readyFocus) tasks.push(updateFocusView(p));
		if (readyNearby) tasks.push(updateNearbyView(p));

		await Promise.all(tasks);
	}

	// radius change handler
	async function handleRadiusChange() {
		if (!selected) return;
		await Promise.all([
			readyFocus ? updateFocusView(selected) : Promise.resolve(),
			readyNearby ? updateNearbyView(selected) : Promise.resolve()
		]);
	}

	// init/default selection once peaks are in runes
	$effect(() => {
		if (selected) return;
		if (currentPeaks.peaks.length === 0) return;
		selected = currentPeaks.peaks[currentPeaks.peaks.length - 1] ?? null;
	});

	// init once when all maps are ready
	$effect(() => {
		if (initialized) return;
		if (!selected) return;
		if (!readyOverview || !readyFocus || !readyNearby) return;

		initialized = true;
		applySelection(selected, "init").catch(console.log);
	});
</script>

<section class="section">
	<div class="container">
		<div class="pp-grid">
			<div class="pp-left">
				<Card title="Peaks">
					<div class="pp-leftInner" style={`height:${OVERVIEW_HEIGHT_VH}vh;`}>
						<div class="pp-leftScroll">
							<PeakSelectionList
								categories={currentCategories.categories}
								peaks={currentPeaks.peaks}
								selectedId={selected?._id}
								onSelect={(p: Peak) => applySelection(p, "list")}
							/>
						</div>

						<div class="pp-leftFooter">
							<hr style="margin: 0.75rem 0;" />
							<div class="field">
								<label class="label is-small" for={radiusInputId}>Nearby radius: {radiusKm} km</label>
								<input
									id={radiusInputId}
									class="slider is-fullwidth"
									type="range"
									min="2"
									max="30"
									step="1"
									bind:value={radiusKm}
									onchange={() => handleRadiusChange().catch(console.log)}
								/>
							</div>
						</div>
					</div>
				</Card>
			</div>

			<div class="pp-overview">
				<Card title="Overview">
					<LeafletMap
						height={OVERVIEW_HEIGHT_VH}
						clusterMarkers={true}
						showTopoLayers={true}
						defaultBase="Standard"
						bind:this={mapOverview}
						onReady={() => {
							readyOverview = true;
						}}
					/>
				</Card>
			</div>

			<div class="pp-bottom">
				<div>
					<Card title="Focus">
						<LeafletMap
							height={BOTTOM_HEIGHT_VH}
							showTopoLayers={true}
							defaultBase="Satellite"
							bind:this={mapFocus}
							onReady={() => {
								readyFocus = true;
							}}
						/>
					</Card>
				</div>

				<div>
					<Card title="Nearby">
						<LeafletMap
							height={BOTTOM_HEIGHT_VH}
							clusterMarkers={false}
							showTopoLayers={true}
							defaultBase="Topo"
							bind:this={mapNearby}
							onReady={() => {
								readyNearby = true;
							}}
						/>
					</Card>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
    .pp-grid {
        display: grid;
        grid-template-columns: 0.62fr 1.38fr;
        grid-template-rows: auto auto;
        gap: 1rem;
        align-items: start;
    }

    .pp-left {
        grid-column: 1;
        grid-row: 1;
    }

    .pp-overview {
        grid-column: 2;
        grid-row: 1;
    }

    .pp-bottom {
        grid-column: 1 / 3;
        grid-row: 2;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .pp-leftInner {
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .pp-leftScroll {
        flex: 1;
        min-height: 0;
        overflow: hidden;
    }

    .pp-leftFooter {
        flex: 0 0 auto;
    }
</style>
