<script lang="ts">
	import "leaflet/dist/leaflet.css";
	import "leaflet.markercluster/dist/MarkerCluster.css";
	import "leaflet.markercluster/dist/MarkerCluster.Default.css";

	import { onMount } from "svelte";
	import type { Control, Map as LeafletMapType, Layer } from "leaflet";

	type MapProps = {
		height?: number;
		onReady?: () => void;
		clusterMarkers?: boolean;
		showTopoLayers?: boolean;
	};

	let {
		height = 60,
		onReady,
		clusterMarkers = false,
		showTopoLayers = false
	} = $props() as MapProps;

	let id = "leaflet-map-" + Math.random().toString(16).slice(2);
	let imap: LeafletMapType;

	let L: typeof import("leaflet").default;
	let control: Control.Layers;

	let baseLayers: Record<string, Layer> = {};
	let overlays: Record<string, Layer> = {};

	let overlayGroups: Record<string, unknown> = {};
	let directLayers: Layer[] = [];

	async function ensureLeaflet() {
		const leaflet = await import("leaflet");
		L = leaflet.default;
		return leaflet;
	}

	async function ensureClusterPlugin() {
		if (!clusterMarkers) return;
		await import("leaflet.markercluster");
	}

	function buildBaseLayers(leaflet: typeof import("leaflet")) {
		const osm = leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 18,
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});

		const esri = leaflet.tileLayer(
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
			OSM: osm,
			Satellite: esri,
			...(showTopoLayers ? { Topo: topo } : {})
		};

		if (showTopoLayers) {
			const hillshade = leaflet.tileLayer("https://tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png", {
				maxZoom: 17,
				opacity: 0.35,
				attribution: 'Hillshade overlay: &copy; <a href="https://wikimedia.org">Wikimedia</a>'
			});
			overlays = { Hillshade: hillshade };
		} else {
			overlays = {};
		}

		return { defaultLayer: showTopoLayers ? baseLayers["Topo"] : baseLayers["OSM"] };
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

	export async function moveTo(lat: number, lng: number, zoomLevel = 10) {
		await ensureLeaflet();
		imap.flyTo({ lat, lng }, zoomLevel);
	}

	export async function fitToPoints(points: Array<{ lat: number; lng: number }>, padding = 30) {
		await ensureLeaflet();
		if (!points || points.length === 0) return;
		const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
		imap.fitBounds(bounds, { padding: [padding, padding] });
	}
</script>

<div {id} class="box" style="height: {height}vh"></div>
