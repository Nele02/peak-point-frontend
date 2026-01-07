<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import PeakForm from "../../PeakForm.svelte";
	import { peakService } from "$lib/services/peak-service";
	import { currentCategories, currentPeaks, loggedInUser } from "$lib/runes.svelte";
	import type { Peak } from "$lib/types/peak-types";
	import { toPeakPayload } from "$lib/utils/peak-payload";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	currentCategories.categories = data.categories;
	let peak = $state<Peak | null>(data.peak ?? null);

	async function submit(updated: Peak, files: File[]) {
		const id = page.params.id;

		if (files.length > 0) {
			const uploaded = await peakService.uploadImages(files);
			updated.images = [...(updated.images ?? []), ...uploaded];
		}

		const payload = toPeakPayload(updated);
		const saved = await peakService.updatePeak(id, payload, loggedInUser.token);

		currentPeaks.peaks = currentPeaks.peaks.map((p) =>
			p._id === id ? saved : p
		);

		goto("/peaks");
	}

	async function removePeak() {
		if (!confirm("Delete this peak?")) return;

		const id = page.params.id;
		await peakService.deletePeak(id, loggedInUser.token);
		currentPeaks.peaks = currentPeaks.peaks.filter((p) => p._id !== id);
		goto("/peaks");
	}
</script>

<section class="section">
	<div class="container">
		{#if peak}
			<div class="mb-4">
				<button class="button is-danger is-light" onclick={removePeak}>
					Delete
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
