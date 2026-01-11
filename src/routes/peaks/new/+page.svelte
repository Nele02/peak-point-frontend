<script lang="ts">
	import { goto } from "$app/navigation";

	import PeakForm from "../PeakForm.svelte";
	import { peakService } from "$lib/services/peak-service";
	import { currentCategories, currentPeaks, loggedInUser } from "$lib/runes.svelte";
	import { refreshCategoryState } from "$lib/services/peak-utils";

	import type { Peak } from "$lib/types/peak-types";
	import { toPeakPayload } from "$lib/services/peak-payload";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	$effect(() => {
		refreshCategoryState(data.categories ?? []);
	});

	const empty: Peak = {
		name: "",
		elevation: 0,
		description: "",
		lat: 0,
		lng: 0,
		categories: [],
		images: []
	};

	async function submit(peak: Peak, files: File[]) {
		if (files.length > 0) {
			const uploaded = await peakService.uploadImages(files);
			peak.images = [...(peak.images ?? []), ...uploaded];
		}

		const payload = toPeakPayload(peak);
		const created = await peakService.createPeak(
			{ ...payload, userid: loggedInUser._id },
			loggedInUser.token
		);

		currentPeaks.peaks = [created, ...currentPeaks.peaks];
		goto("/peaks");
	}
</script>

<section class="section">
	<div class="container">
		<PeakForm
			title="New Peak"
			peak={empty}
			categories={currentCategories.categories}
			submitLabel="Create"
			onSubmit={submit}
			onCancel={() => goto("/peaks")}
		/>
	</div>
</section>
