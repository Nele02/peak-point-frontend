<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import { peakService } from "$lib/services/peak-service";
	import { currentCategories, currentPeaks, loggedInUser, sessionChecked } from "$lib/runes.svelte";

	import PeakToolbar from "$lib/ui/PeakToolbar.svelte";
	import PeakList from "$lib/ui/PeakList.svelte";

	let errorMsg = $state("");

	let loadingPeaks = $state(true);
	let loadingCategories = $state(true);

	let selectedCategoryIds = $state<string[]>([]);

	function toggleCategory(id: string) {
		selectedCategoryIds = selectedCategoryIds.includes(id)
			? selectedCategoryIds.filter((x) => x !== id)
			: [...selectedCategoryIds, id];
	}

	async function loadPeaks() {
		try {
			errorMsg = "";
			loadingPeaks = true;

			const params = selectedCategoryIds.length > 0 ? { categoryIds: selectedCategoryIds } : {};
			currentPeaks.peaks = await peakService.getUserPeaks(loggedInUser._id, params);
		} catch (e) {
			console.log(e);
			errorMsg = "Could not load peaks.";
		} finally {
			loadingPeaks = false;
		}
	}

	async function loadCategories() {
		try {
			loadingCategories = true;
			currentCategories.categories = await peakService.getAllCategories();
		} catch (e) {
			console.log(e);
			errorMsg = "Could not load categories.";
		} finally {
			loadingCategories = false;
		}
	}

	async function applyFilter() {
		await loadPeaks();
	}

	async function clearFilter() {
		selectedCategoryIds = [];
		await loadPeaks();
	}

	onMount(async () => {
		if (!sessionChecked.done) {
			await peakService.restoreSession();
		}

		if (!loggedInUser.token || !loggedInUser._id) {
			goto("/login");
			return;
		}

		await Promise.all([loadCategories(), loadPeaks()]);
	});
</script>

<section class="section">
	<div class="container">
		<PeakToolbar
			categories={currentCategories.categories}
			selected={selectedCategoryIds}
			onToggle={toggleCategory}
			onApply={applyFilter}
			onClear={clearFilter}
		/>

		{#if loadingCategories}
			<p class="has-text-grey is-size-7 mb-2">Loading categories…</p>
		{/if}

		{#if errorMsg}
			<div class="notification is-danger is-light">{errorMsg}</div>
		{/if}

		{#if loadingPeaks}
			<progress class="progress is-small is-link" max="100">Loading</progress>
		{:else}
			<PeakList peaks={currentPeaks.peaks} />
		{/if}

	</div>
</section>
