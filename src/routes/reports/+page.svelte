<script lang="ts">
	import Card from "$lib/ui/Card.svelte";
	import Chart from "svelte-frappe-charts";

	import type { PageProps } from "./$types";

	import { currentPeaks, currentCategories } from "$lib/runes.svelte";
	import {
		computeElevationBands,
		computeElevationLine,
		computePeaksPerCategory,
		filterPeaks
	} from "$lib/services/report-utils";

	let { data }: PageProps = $props();

	$effect(() => {
		currentPeaks.peaks = data.peaks ?? [];
		currentCategories.categories = data.categories ?? [];
	});

	let selectedCategoryIds = $state<string[]>([]);
	let minElevation = $state<number>(0);

	const filtered = $derived(() => filterPeaks(currentPeaks.peaks, selectedCategoryIds, minElevation));

	const barData = $derived(() => computePeaksPerCategory(filtered(), currentCategories.categories));
	const pieData = $derived(() => computeElevationBands(filtered()));
	const lineData = $derived(() => computeElevationLine(filtered()));

	function categoryName(id: string) {
		return currentCategories.categories.find((c) => c._id === id)?.name ?? "";
	}

	function isSelected(id: string) {
		return selectedCategoryIds.includes(id);
	}

	function toggleCategory(id: string) {
		selectedCategoryIds = isSelected(id)
			? selectedCategoryIds.filter((x) => x !== id)
			: [...selectedCategoryIds, id];
	}

	function clearCategories() {
		selectedCategoryIds = [];
	}

	function removeCategory(id: string) {
		selectedCategoryIds = selectedCategoryIds.filter((x) => x !== id);
	}
</script>

<section class="section">
	<div class="container">
		<div class="columns is-variable is-4 pp-row">
			<div class="column is-4">
				<Card title="Filters">
					<div class="is-flex is-flex-direction-column" style="gap: 1rem;">
						<div class="is-flex is-justify-content-space-between is-align-items-center">
							<p class="has-text-weight-semibold">Categories</p>
							<button
								class="button is-small is-light"
								type="button"
								onclick={clearCategories}
								disabled={selectedCategoryIds.length === 0}
							>
								Clear
							</button>
						</div>

						{#if selectedCategoryIds.length > 0}
							<div class="tags">
								{#each selectedCategoryIds as id (id)}
									{#if categoryName(id)}
										<span class="tag is-info is-light">
											{categoryName(id)}
											<button
												class="delete is-small"
												type="button"
												aria-label={`Remove category ${categoryName(id)}`}
												onclick={() => removeCategory(id)}
											></button>
										</span>
									{/if}
								{/each}
							</div>
						{:else}
							<p class="help">No category filter applied.</p>
						{/if}

						<div class="box p-0 pp-catBox">
							{#if currentCategories.categories.length === 0}
								<div class="p-3">
									<p class="has-text-grey is-size-7">No categories available.</p>
								</div>
							{:else}
								{#each currentCategories.categories as c (c._id)}
									<label class="pp-catRow">
										<input type="checkbox" checked={isSelected(c._id)} onchange={() => toggleCategory(c._id)} />
										<span class="is-size-7">{c.name}</span>
									</label>
								{/each}
							{/if}
						</div>

						<div class="field">
							<label class="label" for="min-elevation">Minimum elevation (m)</label>
							<div class="control">
								<input
									id="min-elevation"
									class="input"
									type="number"
									min="0"
									step="50"
									bind:value={minElevation}
								/>
							</div>
						</div>

						<p class="is-size-7 has-text-grey">
							Showing <strong>{filtered().length}</strong> / {currentPeaks.peaks.length} peaks
						</p>
					</div>
				</Card>
			</div>

			<div class="column is-8">
				<Card title="Peaks per Category">
					<Chart type="bar" data={barData()} />
				</Card>
			</div>
		</div>

		<div class="columns is-variable is-4 pp-row">
			<div class="column is-4">
				<Card title="Elevation Bands">
						<Chart type="pie" maxSlices="10" data={pieData()} />
				</Card>
			</div>

			<div class="column is-8">
				<Card title="Elevation">
					<Chart type="line" data={lineData()} />
				</Card>
			</div>
		</div>
	</div>
</section>

<style>
    .pp-row {
        align-items: stretch;
    }

    .pp-catBox {
        max-height: 12rem;
        overflow: auto;
    }

    .pp-catRow {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid #f2f2f2;
    }
</style>