import type LeafletMap from "$lib/ui/LeafletMap.svelte";
import type { Peak, Category } from "$lib/types/peak-types";

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function peakCategoryIds(p: Peak): string[] {
  const c = (p as unknown as { categories?: unknown }).categories;
  if (!c) return [];

  if (Array.isArray(c) && c.every((x) => typeof x === "string")) return c as string[];

  if (
    Array.isArray(c) &&
    c.every((x) => typeof x === "object" && x !== null && "_id" in (x as Record<string, unknown>))
  ) {
    return (c as Array<{ _id: string }>).map((x) => x._id);
  }

  return [];
}

function categoryNamesForPeak(p: Peak, categories: Category[]) {
  const ids = peakCategoryIds(p);
  if (!ids.length) return [];

  return ids
    .map((id) => categories.find((c) => c._id === id)?.name)
    .filter((x): x is string => Boolean(x));
}

export function peakPopupHtml(p: Peak, categories: Category[]) {
  const name = typeof p.name === "string" && p.name.trim() ? p.name : "Peak";
  const elev = Number.isFinite(p.elevation) ? `${p.elevation} m` : "";
  const cats = categoryNamesForPeak(p, categories);

  const catsHtml = cats.length ? `<br/><small>${escapeHtml(cats.join(", "))}</small>` : "";

  const descRaw = (p as unknown as { description?: unknown }).description;
  const desc = typeof descRaw === "string" && descRaw.trim() ? `<br/>${escapeHtml(descRaw)}` : "";

  return `<strong>${escapeHtml(name)}</strong><br/>${escapeHtml(elev)}${catsHtml}${desc}`;
}

export async function renderPeaksOnMap(
  map: LeafletMap,
  peaks: Peak[],
  categories: Category[],
  onSelect?: (p: Peak) => void,
  overlayName = "Peaks"
) {
  await map.clearOverlays();
  await map.clearMarkers();

  await map.addOverlay(overlayName);

  for (const p of peaks) {
    await map.addMarkerToOverlay(overlayName, p.lat, p.lng, peakPopupHtml(p, categories), () =>
      onSelect?.(p)
    );
  }
}

export async function zoomInitial(map: LeafletMap, peaks: Peak[], selected: Peak | null) {
  if (selected) {
    await map.moveTo(selected.lat, selected.lng, 11);
    return;
  }

  if (peaks.length > 0) {
    await map.fitToPoints(
      peaks.map((p) => ({ lat: p.lat, lng: p.lng })),
      40
    );
  }
}
