import type { Category, Peak, StoredImage } from "$lib/types/peak-types";

export type PeakPayload = {
  name: string;
  description?: string;
  elevation: number;
  lat: number;
  lng: number;
  categories: string[];
  images: StoredImage[];
};

function isCategoryObjectArray(value: unknown): value is Category[] {
  return (
    Array.isArray(value) &&
    value.every((v) => typeof v === "object" && v !== null && "_id" in v && "name" in v)
  );
}

export function toPeakPayload(peak: Peak): PeakPayload {
  const images = (peak.images ?? []) as StoredImage[];

  let categories: string[] = [];
  const raw = peak.categories as unknown;

  if (Array.isArray(raw) && raw.every((c) => typeof c === "string")) {
    categories = raw as string[];
  } else if (isCategoryObjectArray(raw)) {
    categories = raw.map((c) => c._id);
  }

  return {
    name: peak.name,
    description: peak.description ?? "",
    elevation: Number(peak.elevation) || 0,
    lat: Number(peak.lat) || 0,
    lng: Number(peak.lng) || 0,
    categories,
    images
  };
}
