<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";

	import PeakForm from "../../PeakForm.svelte";
	import { peakService } from "$lib/services/peak-service";
	import { currentCategories, currentPeaks, loggedInUser, sessionChecked } from "$lib/runes.svelte";
	import type { Peak } from "$lib/types/peak-types";
	import { toPeakPayload } from "$lib/utils/peak-payload";

	let loading = $state(true);
	let errorMsg = $state("");
	let peak = $state<Peak | null>(null);

	function requireParamId(value: string | undefined): string {
		if (!value) throw new Error("Missing peak id");
		return value;
	}

	onMount(async () => {
		try {
			if (!sessionChecked.done) await peakService.restoreSession();
			if (!loggedInUser.token || !loggedInUser._id) {
				goto("/login");
				return;
			}

			const id = requireParamId(page.params.id);

			if (currentCategories.categories.length === 0) {
				currentCategories.categories = await peakService.getAllCategories();
			}

			peak = await peakService.getPeakById(id);
		} catch (e) {
			console.log(e);
			errorMsg = "Could not load peak.";
		} finally {
			loading = false;
		}
	});

	async function submit(updated: Peak, files: File[]) {
		const id = requireParamId(page.params.id);

		if (files.length > 0) {
			const uploaded = await peakService.uploadImages(files);
			updated.images = [...(updated.images ?? []), ...uploaded];
		}

		const payload = toPeakPayload(updated);
		const saved = await peakService.updatePeak(id, payload);

		currentPeaks.peaks = currentPeaks.peaks.map((p) => (p._id === id ? saved : p));
		goto("/peaks");
	}

	async function removePeak() {
		const id = requireParamId(page.params.id);

		const ok = confirm("Delete this peak?");
		if (!ok) return;

		await peakService.deletePeak(id);
		currentPeaks.peaks = currentPeaks.peaks.filter((p) => p._id !== id);

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
		{:else if peak}
			<div class="mb-4">
				<button class="button is-danger is-light" type="button" onclick={removePeak}>
					<span class="icon is-small"><i class="fas fa-trash"></i></span>
					<span>Delete</span>
				</button>
			</div>

			<PeakForm
				title="Edit Peak"
				peak={peak}
				categories={currentCategories.categories}
				submitLabel="Save"
				onSubmit={submit}
				onCancel={() => goto("/peaks")}
			/>
		{:else}
			<div class="notification is-light">Peak not found.</div>
		{/if}
	</div>
</section>
