<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	import PeakForm from "../PeakForm.svelte";
	import { peakService } from "$lib/services/peak-service";
	import { currentCategories, currentPeaks, loggedInUser, sessionChecked } from "$lib/runes.svelte";
	import type { Peak } from "$lib/types/peak-types";
	import { toPeakPayload } from "$lib/utils/peak-payload";

	const emptyPeak: Peak = {
		name: "",
		elevation: 0,
		description: "",
		lat: 0,
		lng: 0,
		categories: [],
		images: []
	};

	let loading = $state(true);
	let errorMsg = $state("");

	onMount(async () => {
		try {
			if (!sessionChecked.done) await peakService.restoreSession();
			if (!loggedInUser.token || !loggedInUser._id) {
				goto("/login");
				return;
			}
			if (currentCategories.categories.length === 0) {
				currentCategories.categories = await peakService.getAllCategories();
			}
		} catch (e) {
			console.log(e);
			errorMsg = "Could not load categories.";
		} finally {
			loading = false;
		}
	});

	async function submit(peak: Peak, files: File[]) {
		if (files.length > 0) {
			const uploaded = await peakService.uploadImages(files);
			peak.images = [...(peak.images ?? []), ...uploaded];
		}

		const payload = toPeakPayload(peak);

		const created = await peakService.createPeak({ ...payload, userid: loggedInUser._id });

		currentPeaks.peaks = [created, ...currentPeaks.peaks];
		goto("/peaks");
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
			<PeakForm
				title="New Peak"
				peak={emptyPeak}
				categories={currentCategories.categories}
				submitLabel="Create"
				onSubmit={submit}
				onCancel={() => goto("/peaks")}
			/>
		{/if}
	</div>
</section>
