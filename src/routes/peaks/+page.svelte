<script lang="ts">
	import { goto } from "$app/navigation";

	import { currentCategories, currentPeaks } from "$lib/runes.svelte";
	import { refreshPeakState } from "$lib/services/peak-utils";

	import PeakToolbar from "$lib/ui/PeakToolbar.svelte";
	import PeakList from "$lib/ui/PeakList.svelte";

	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	const pageData = $derived(() => data);

	const peaks = $derived(() => pageData().peaks ?? []);
	const categories = $derived(() => pageData().categories ?? []);

	let lastPeaks: unknown = undefined;
	let lastCategories: unknown = undefined;
	$effect(() => {
		const p = peaks();
		const c = categories();
		if (lastPeaks !== p || lastCategories !== c) {
			lastPeaks = p;
			lastCategories = c;
			refreshPeakState(p, c);
		}
	});

	const selectedFromUrl = $derived(() => pageData().selectedCategoryIds ?? []);

	let selected = $derived.by(() => selectedFromUrl());

	$effect(() => {
		selected = selectedFromUrl();
	});

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
	}

	function buildQuery(): string {
		if (selected.length === 0) return "";
		return selected.map((id) => `categoryIds=${encodeURIComponent(id)}`).join("&");
	}

	async function apply() {
		const qs = buildQuery();
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(qs ? `/peaks?${qs}` : "/peaks", { invalidateAll: true });
	}

	async function clear() {
		selected = [];
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto("/peaks", { invalidateAll: true });
	}
</script>

<section class="section">
	<div class="container">
		<PeakToolbar
			categories={currentCategories.categories}
			selected={selected}
			onToggle={toggle}
			onApply={apply}
			onClear={clear}
		/>

		<PeakList peaks={currentPeaks.peaks} />
	</div>
</section>
