import type { Category, Peak } from '$lib/types/peak-types';

export const subTitle = $state({ text: "" })

export const loggedInUser = $state({
	email: "",
	name: "",
	token: "",
	_id: ""
});

export const currentPeaks = $state({ peaks: [] as Peak[]});

export const currentCategories = $state({ categories: [] as Category[] });