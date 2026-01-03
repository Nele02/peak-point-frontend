<script lang="ts">
	import type { Category, Peak } from "$lib/types/peak-types";
	import Card from "$lib/ui/Card.svelte";
	import ImageCarousel from "$lib/ui/ImageCarousel.svelte";

	const props = $props<{ peak: Peak }>();
	const peak = props.peak;

	function isCategoryObjectArray(value: unknown): value is Category[] {
		return (
			Array.isArray(value) &&
			value.every((v) => typeof v === "object" && v !== null && "_id" in v && "name" in v)
		);
	}

	function categoryNames(): string[] {
		if (!peak.categories) return [];
		if (Array.isArray(peak.categories) && peak.categories.every((c) => typeof c === "string")) {
			return peak.categories as string[];
		}
		if (isCategoryObjectArray(peak.categories)) {
			return peak.categories.map((c) => c.name);
		}
		return [];
	}
</script>

<div data-testid="peak-card" style="height: 100%;">
	<Card title={peak.name}>
		{#if peak.images && peak.images.length > 0}
			<div class="mb-4">
				<ImageCarousel images={peak.images} max={10} peakName={peak.name} />
			</div>
		{/if}

		<p class="mb-2">
			<span class="icon mr-1"><i class="fas fa-mountain"></i></span>
			<strong>{peak.elevation}</strong> m
		</p>

		{#if peak.description}
			<p class="has-text-grey mb-3">{peak.description}</p>
		{/if}

		<p class="is-size-7 has-text-grey mb-3">
			<span class="icon mr-1"><i class="fas fa-map-marker-alt"></i></span>
			{peak.lat}, {peak.lng}
		</p>

		{#if categoryNames().length > 0}
			<div class="tags">
				{#each categoryNames() as cn (cn)}
					<span class="tag is-info is-light">{cn}</span>
				{/each}
			</div>
		{/if}

		<div class="buttons mt-4">
			<a class="button is-small is-link is-light" href={`/peaks/${peak._id}/edit`}>
				<span class="icon is-small"><i class="fas fa-edit"></i></span>
				<span>Edit</span>
			</a>
		</div>
	</Card>
</div>
