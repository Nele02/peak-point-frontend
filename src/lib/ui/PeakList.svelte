<script lang="ts">
	import type { Peak } from "$lib/types/peak-types";
	import PeakCard from "$lib/ui/PeakCard.svelte";

	const props = $props<{ peaks?: Peak[] }>();

	let peaks = $derived(props.peaks ?? []);
</script>

{#if peaks.length === 0}
	<div class="notification is-light" data-testid="no-peaks">
		No peaks yet. Create your first one!
	</div>
{:else}
	<div class="columns is-multiline">
		{#each peaks as p (p._id)}
			<div class="column is-one-third is-flex">
				<div style="width: 100%;">
					<PeakCard peak={p} />
				</div>
			</div>
		{/each}
	</div>
{/if}
