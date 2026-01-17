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
  import { onMount } from "svelte";
  import type {
    Control,
    Layer,
    Map as LeafletMapType,
    Marker,
    Circle,
    LayerGroup,
    MarkerClusterGroup
  } from "leaflet";

  type LeafletModule = typeof import("leaflet");

  import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
  import markerIcon from "leaflet/dist/images/marker-icon.png";
  import markerShadow from "leaflet/dist/images/marker-shadow.png";

  export let height: number = 60;
  export let onReady: (() => void) | undefined;
  export let clusterMarkers: boolean = false;
  export let showTopoLayers: boolean = false;
  export let defaultBase: "Standard" | "Satellite" | "Topo" = "Standard";

  let id = "leaflet-map-" + Math.random().toString(16).slice(2);

  let imap: LeafletMapType;
  let control: Control.Layers;

  let L: LeafletModule | undefined;
  let clusterLoaded = false;

  let baseLayers: Record<string, Layer> = {};
  let overlays: Record<string, Layer> = {};

  let overlayGroups: Record<string, LayerGroup | MarkerClusterGroup> = {};
  let directLayers: Layer[] = [];

  // Loads Leaflet in the browser
  async function ensureLeaflet() {
    if (L) return L;

    const leafletMod = await import("leaflet");
    const leaflet = ((leafletMod as unknown as { default?: LeafletModule }).default ??
      (leafletMod as unknown as LeafletModule)) as LeafletModule;

    L = leaflet;

    // Some plugins (like markercluster) expect a global `L`.
    (globalThis as unknown as { L?: LeafletModule }).L = leaflet;

    // Fix marker icon URLs for bundlers (Vite) by setting explicit image paths.
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow
    });

    return leaflet;
  }

  // Loads the markercluster plugin only when clustering is enabled.
  async function ensureClusterPlugin() {
    if (!clusterMarkers) return;
    if (clusterLoaded) return;

    await ensureLeaflet();
    await import("leaflet.markercluster");

    clusterLoaded = true;
  }

  // Creates the base tile layers and returns which one should be active by default.
  function buildBaseLayers() {
    if (!L) throw new Error("Leaflet not loaded");
    const standard = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
      }
    );

    const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
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

    const pick = (defaultBase === "Topo" && !showTopoLayers ? "Standard" : defaultBase) as
      | "Standard"
      | "Satellite"
      | "Topo";

    return { defaultLayer: baseLayers[pick] ?? baseLayers["Standard"] };
  }

  onMount(async () => {
    // Init map on component mount.
    // Make sure Leaflet is loaded before we access `L.map()` etc.
    await ensureLeaflet();
    await ensureClusterPlugin();

    // After ensureLeaflet() `L` must be available. We keep a local non-undefined reference.
    const leaflet = L!;

    const { defaultLayer } = buildBaseLayers();

    // Create the actual map instance.
    imap = leaflet.map(id, {
      center: [53.2734, -7.7783203],
      zoom: 7,
      minZoom: 3,
      layers: [defaultLayer]
    });

    // Adds the layer switcher UI (base layers + overlays) on the map.
    control = leaflet.control.layers(baseLayers, overlays).addTo(imap);

    onReady?.();
  });

  // Gets (or creates) an overlay group by name, so we can add markers into it.
  function ensureOverlayGroup(name: string) {
    if (!L) throw new Error("Leaflet not loaded");
    const existing = overlayGroups[name];
    if (existing) return existing;

    const group = (clusterMarkers ? L.markerClusterGroup() : L.layerGroup()) as
      | MarkerClusterGroup
      | LayerGroup;
    overlayGroups[name] = group;

    control.addOverlay(group as unknown as Layer, name);
    group.addTo(imap);

    return group;
  }

  // Waits until the map finished moving (used for flyTo/flyToBounds).
  function waitForMoveEnd(): Promise<void> {
    return new Promise((resolve) => {
      const handler = () => {
        imap.off("moveend", handler);
        resolve();
      };
      imap.on("moveend", handler);
    });
  }

  // Creates an overlay layer entry in the layer-control UI.
  export async function addOverlay(name: string) {
    await ensureLeaflet();
    await ensureClusterPlugin();
    ensureOverlayGroup(name);
  }

  // Clears all named overlay groups.
  export async function clearOverlays() {
    await clearOverlayGroups();
  }

  // Clears markers/circles that were added directly (not inside overlays).
  export async function clearMarkers() {
    await clearDirectLayers();
  }

  // Removes overlay groups from the map and resets our internal overlay state.
  export async function clearOverlayGroups() {
    await ensureLeaflet();
    if (!L) throw new Error("Leaflet not loaded");

    for (const g of Object.values(overlayGroups)) {
      if (typeof g.clearLayers === "function") g.clearLayers();
      if (imap && imap.hasLayer(g)) imap.removeLayer(g);
    }

    overlayGroups = {};
  }

  // Removes direct layers from the map and resets our internal list.
  export async function clearDirectLayers() {
    await ensureLeaflet();
    if (!L) throw new Error("Leaflet not loaded");

    for (const layer of directLayers) {
      if (imap && imap.hasLayer(layer)) imap.removeLayer(layer);
    }
    directLayers = [];
  }

  // Adds a marker to a named overlay group (optional popup + click callback).
  export async function addMarkerToOverlay(
    overlayName: string,
    lat: number,
    lng: number,
    popupHtml: string,
    onClick?: () => void
  ) {
    await ensureLeaflet();
    await ensureClusterPlugin();

    // After ensureLeaflet(), Leaflet must be assigned.
    const leaflet = L!;

    const group = ensureOverlayGroup(overlayName);

    const marker: Marker = leaflet.marker([lat, lng]);
    if (popupHtml) marker.bindPopup(popupHtml);
    if (onClick) marker.on("click", () => onClick());

    group.addLayer(marker);
    return marker;
  }

  // Adds a marker directly to the map.
  export async function addMarker(lat: number, lng: number, popupHtml: string): Promise<Marker> {
    await ensureLeaflet();
    if (!L) throw new Error("Leaflet not loaded");
    const marker: Marker = L.marker([lat, lng]).addTo(imap);
    if (popupHtml) marker.bindPopup(popupHtml);
    directLayers.push(marker);
    return marker;
  }

  // Adds a circle directly to the map (radius display).
  export async function addCircle(
    lat: number,
    lng: number,
    radiusMeters: number,
    popupHtml?: string
  ) {
    await ensureLeaflet();
    if (!L) throw new Error("Leaflet not loaded");
    const circle: Circle = L.circle([lat, lng], { radius: radiusMeters });
    if (popupHtml) circle.bindPopup(popupHtml);
    circle.addTo(imap);
    directLayers.push(circle);
    return circle;
  }

  // Moves the map to a point with an animation.
  export async function moveTo(lat: number, lng: number, zoomLevel = 10, duration = 0.8) {
    await ensureLeaflet();
    if (!L) throw new Error("Leaflet not loaded");
    const done = waitForMoveEnd();
    imap.flyTo([lat, lng] as [number, number], zoomLevel, { animate: true, duration });
    await done;
  }

  // Zooms/pans so all given points are visible.
  export async function fitToPoints(
    points: Array<{ lat: number; lng: number }>,
    padding = 30,
    duration = 0.8
  ) {
    await ensureLeaflet();
    if (!L) throw new Error("Leaflet not loaded");
    if (!points || points.length === 0) return;

    const done = waitForMoveEnd();
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    imap.flyToBounds(bounds, { padding: [padding, padding], animate: true, duration });
    await done;
  }
</script>

<div {id} class="box" style="height: {height}vh"></div>
