<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import {currentCategories, currentPeaks, loggedInUser, sessionChecked, curentDataSets } from "$lib/runes.svelte";

	import { peakService } from "$lib/services/peak-service";
	import { computePeaksByCategory, refreshPeakMap } from "$lib/services/peak-utils";

	import Card from "$lib/ui/Card.svelte";
	import LeafletMap from "$lib/ui/LeafletMap.svelte";
	import PeakSelectionList from "$lib/ui/PeakSelectionList.svelte";
	import PeakCard from "$lib/ui/PeakCard.svelte";

	import Chart from "svelte-frappe-charts";

	import type { Peak, StoredImage } from "$lib/types/peak-types";

	let loading = $state(true);
	let errorMsg = $state("");

	let map = $state<LeafletMap | null>(null);
	let mapReady = $state(false);

	let selectedPeak = $state<Peak | null>(null);

	function normalizeSelectedPeak(p: Peak): Peak {
		const imgs = (p.images ?? []) as StoredImage[];
		return { ...p, images: imgs };
	}

	function selectPeak(p: Peak) {
		selectedPeak = normalizeSelectedPeak(p);
		map?.moveTo(p.lat, p.lng);
	}

	async function refreshDashboard() {
		if (!mapReady || !map) return;

		computePeaksByCategory(currentPeaks.peaks, currentCategories.categories);

		await map.clearOverlays();
		await refreshPeakMap(map, currentPeaks.peaks, currentCategories.categories, selectPeak);

		const last = currentPeaks.peaks[currentPeaks.peaks.length - 1];
		if (last && !selectedPeak) {
			selectPeak(last);
		}
	}

	onMount(async () => {
		try {
			errorMsg = "";
			loading = true;

			if (!sessionChecked.done) await peakService.restoreSession();

			if (!loggedInUser.token || !loggedInUser._id) {
				goto("/login");
				return;
			}

			if (currentCategories.categories.length === 0 || currentPeaks.peaks.length === 0) {
				await peakService.refreshPeakInfo();
			}
		} catch (e) {
			console.log(e);
			errorMsg = "Could not load dashboard.";
		} finally {
			loading = false;
		}
	});

	async function handleMapReady() {
		mapReady = true;
		try {
			await refreshDashboard();
		} catch (e) {
			console.log(e);
			errorMsg = "Could not load dashboard.";
		}
	}
</script>

<section class="section">
	<div class="container">
		{#if errorMsg}
			<div class="notification is-danger is-light">{errorMsg}</div>
		{/if}

		{#if loading}
			<progress class="progress is-small is-link" max="100">Loading</progress>
		{:else}
			<!-- ROW 1: selection list + map -->
			<div class="columns">
				<div class="column is-4">
					<Card title="Peaks">
						<PeakSelectionList
							categories={currentCategories.categories}
							peaks={currentPeaks.peaks}
							selectedId={selectedPeak?._id}
							onSelect={selectPeak}
						/>
					</Card>
				</div>

				<div class="column is-8">
					<Card title="Map">
						<LeafletMap height={45} bind:this={map} onReady={handleMapReady} />
					</Card>
				</div>
			</div>

			<div class="columns">
				<div class="column is-4">
					{#if selectedPeak}
						<PeakCard peak={selectedPeak} showEdit={false} />
					{:else}
						<Card title="Selected Peak">
							<p class="has-text-grey">Click a marker or choose a peak from the list.</p>
						</Card>
					{/if}
				</div>

				<div class="column is-8">
					<Card title="Peaks per Category">
						<div style="width: 100%;">
							<Chart data={curentDataSets.peaksByCategory} type="bar" />
						</div>
					</Card>
				</div>
			</div>
		{/if}
	</div>
</section>
