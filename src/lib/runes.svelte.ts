import type { Category, Peak } from "$lib/types/peak-types";

export const loggedInUser = $state({
  email: "",
  name: "",
  token: "",
  _id: ""
});

export const currentPeaks = $state({ peaks: [] as Peak[] });

export const currentCategories = $state({ categories: [] as Category[] });

export const curentDataSets = $state({
  peaksByCategory: { labels: [] as string[], datasets: [{ values: [] as number[] }] }
});
