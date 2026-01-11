<script context="module" lang="ts">
	export interface Props {
		height?: number;
		onReady?: () => void;
		clusterMarkers?: boolean;
		showTopoLayers?: boolean;
		defaultBase?: "Standard" | "Satellite" | "Topo";
	}
</script>

<script lang="ts">
	import "leaflet.markercluster/dist/MarkerCluster.css";
	import "leaflet.markercluster/dist/MarkerCluster.Default.css";

	import { onMount } from "svelte";
	import type { Control, Map as LeafletMapType, Layer } from "leaflet";

	export let height: number = 60;
	export let onReady: (() => void) | undefined;
	export let clusterMarkers: boolean = false;
	export let showTopoLayers: boolean = false;
	export let defaultBase: "Standard" | "Satellite" | "Topo" = "Standard";

	let id = "leaflet-map-" + Math.random().toString(16).slice(2);
	let imap: LeafletMapType;

	let L: typeof import("leaflet");
	let control: Control.Layers;

	let baseLayers: Record<string, Layer> = {};
	let overlays: Record<string, Layer> = {};

	// Overlay groups: LayerGroup OR MarkerClusterGroup
	let overlayGroups: Record<string, unknown> = {};
	let directLayers: Layer[] = [];

	async function ensureLeaflet() {
		const leaflet = await import("leaflet");
		L = leaflet;
		return leaflet;
	}

	async function ensureClusterPlugin() {
		if (!clusterMarkers) return;
		await import("leaflet.markercluster");
	}

	function buildBaseLayers(leaflet: typeof import("leaflet")) {
		const standard = leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 18,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});

		const satellite = leaflet.tileLayer(
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
			{
				attribution:
					"Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
			}
		);

		const topo = leaflet.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
			maxZoom: 17,
			attribution:
				'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
		});

		baseLayers = {
			Standard: standard,
			Satellite: satellite,
			...(showTopoLayers ? { Topo: topo } : {})
		};

		overlays = {};

		const pick =
			(defaultBase === "Topo" && !showTopoLayers ? "Standard" : defaultBase) as "Standard" | "Satellite" | "Topo";

		return { defaultLayer: baseLayers[pick] ?? baseLayers["Standard"] };
	}

	onMount(async () => {
		const leaflet = await ensureLeaflet();
		await ensureClusterPlugin();

		const { defaultLayer } = buildBaseLayers(leaflet);

		imap = leaflet.map(id, {
			center: [53.2734, -7.7783203],
			zoom: 7,
			minZoom: 3,
			layers: [defaultLayer]
		});

		control = leaflet.control.layers(baseLayers, overlays).addTo(imap);

		onReady?.();
	});

	function ensureOverlayGroup(name: string) {
		const existing = overlayGroups[name];
		if (existing) return existing;

		const group = clusterMarkers
			? (L as unknown as { markerClusterGroup: () => unknown }).markerClusterGroup()
			: L.layerGroup();

		overlayGroups[name] = group;

		control.addOverlay(group as unknown as Layer, name);
		(group as unknown as { addTo: (m: LeafletMapType) => void }).addTo(imap);

		return group;
	}

	function waitForMoveEnd(): Promise<void> {
		return new Promise((resolve) => {
			const handler = () => {
				imap.off("moveend", handler);
				resolve();
			};
			imap.on("moveend", handler);
		});
	}

	// ✅ Needed by Dashboard refreshPeakMap()
	export async function addOverlay(name: string) {
		await ensureLeaflet();
		await ensureClusterPlugin();
		ensureOverlayGroup(name);
	}

	export async function clearOverlays() {
		await clearOverlayGroups();
	}

	export async function clearMarkers() {
		await clearDirectLayers();
	}

	export async function clearOverlayGroups() {
		await ensureLeaflet();

		for (const g of Object.values(overlayGroups)) {
			(g as { clearLayers: () => void }).clearLayers();
			if (imap.hasLayer(g as unknown as Layer)) imap.removeLayer(g as unknown as Layer);
		}

		overlayGroups = {};
	}

	export async function clearDirectLayers() {
		await ensureLeaflet();

		for (const layer of directLayers) {
			if (imap.hasLayer(layer)) imap.removeLayer(layer);
		}
		directLayers = [];
	}

	export async function addMarkerToOverlay(
		overlayName: string,
		lat: number,
		lng: number,
		popupHtml: string,
		onClick?: () => void
	) {
		await ensureLeaflet();
		await ensureClusterPlugin();

		const group = ensureOverlayGroup(overlayName);

		const marker = L.marker([lat, lng]);
		if (popupHtml) marker.bindPopup(popupHtml);
		if (onClick) marker.on("click", () => onClick());

		(group as { addLayer: (layer: Layer) => void }).addLayer(marker);
		return marker;
	}

	export async function addMarker(lat: number, lng: number, popupHtml: string) {
		await ensureLeaflet();
		const marker = L.marker([lat, lng]).addTo(imap);
		if (popupHtml) marker.bindPopup(popupHtml);
		directLayers.push(marker);
		return marker;
	}

	export async function addCircle(lat: number, lng: number, radiusMeters: number, popupHtml?: string) {
		await ensureLeaflet();
		const circle = L.circle([lat, lng], { radius: radiusMeters });
		if (popupHtml) circle.bindPopup(popupHtml);
		circle.addTo(imap);
		directLayers.push(circle);
		return circle;
	}

	export async function moveTo(lat: number, lng: number, zoomLevel = 10, duration = 0.8) {
		await ensureLeaflet();
		const done = waitForMoveEnd();
		imap.flyTo([lat, lng] as [number, number], zoomLevel, { animate: true, duration });
		await done;
	}

	export async function fitToPoints(
		points: Array<{ lat: number; lng: number }>,
		padding = 30,
		duration = 0.8
	) {
		await ensureLeaflet();
		if (!points || points.length === 0) return;

		const done = waitForMoveEnd();
		const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
		imap.flyToBounds(bounds, { padding: [padding, padding], animate: true, duration });
		await done;
	}
</script>

<div {id} class="box" style="height: {height}vh"></div>
