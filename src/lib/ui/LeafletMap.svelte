<script lang="ts">
	import "leaflet/dist/leaflet.css";
	import { onMount } from "svelte";
	import type { Control, LayerGroup, Map as LeafletMapType } from "leaflet";

	let { height = 80, onReady } = $props<{ height?: number; onReady?: () => void }>();

	let id = "home-map-id";
	let location = { lat: 53.2734, lng: -7.7783203 };
	let zoom = 8;
	let minZoom = 6;
	let activeLayer = "Terrain";

	let imap: LeafletMapType;
	let control: Control.Layers;

	let overlays: Control.LayersObject = {};
	let overlayGroups: Record<string, LayerGroup> = {};

	let baseLayers: any;
	let L: any;

	onMount(async () => {
		const leaflet = await import("leaflet");
		L = leaflet.default;

		baseLayers = {
			Terrain: leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 17,
				attribution:
					'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}),
			Satellite: leaflet.tileLayer(
				"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
				{
					attribution:
						"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
				}
			)
		};

		let defaultLayer = baseLayers[activeLayer];

		imap = leaflet.map(id, {
			center: [location.lat, location.lng],
			zoom: zoom,
			minZoom: minZoom,
			layers: [defaultLayer]
		});

		control = leaflet.control.layers(baseLayers, overlays).addTo(imap);
		onReady?.();
	});

	export async function addOverlay(name: string) {
		const leaflet = await import("leaflet");
		L = leaflet.default;

		if (overlayGroups[name]) return;

		const group = leaflet.layerGroup();
		overlayGroups[name] = group;

		overlays[name] = group;
		control.addOverlay(group, name);

		group.addTo(imap);
	}

	export async function clearOverlays() {
		const leaflet = await import("leaflet");
		L = leaflet.default;

		Object.values(overlayGroups).forEach((g) => {
			g.clearLayers();
			if (imap.hasLayer(g)) imap.removeLayer(g);
		});
		overlayGroups = {};
		overlays = {};

		control.remove();
		control = leaflet.control.layers(baseLayers, overlays).addTo(imap);
	}

	export async function addMarker(lat: number, lng: number, popupText: string) {
		const leaflet = await import("leaflet");
		L = leaflet.default;

		const marker = L.marker([lat, lng]).addTo(imap);
		const popup = L.popup({ autoClose: false, closeOnClick: false });
		popup.setContent(popupText);
		marker.bindPopup(popup);
	}

	export async function addMarkerToOverlay(
		overlayName: string,
		lat: number,
		lng: number,
		popupText: string,
		onClick?: () => void
	) {
		const leaflet = await import("leaflet");
		L = leaflet.default;

		if (!overlayGroups[overlayName]) {
			await addOverlay(overlayName);
		}

		const marker = L.marker([lat, lng]);
		const popup = L.popup({ autoClose: false, closeOnClick: false });
		popup.setContent(popupText);
		marker.bindPopup(popup);

		if (onClick) {
			marker.on("click", () => onClick());
		}

		overlayGroups[overlayName].addLayer(marker);
	}


	export async function moveTo(lat: number, lng: number, zoomLevel: number = 9) {
		const leaflet = await import("leaflet");
		L = leaflet.default;
		imap.flyTo({ lat: lat, lng: lng }, zoomLevel);
	}
</script>

<div {id} class="box" style="height: {height}vh"></div>
