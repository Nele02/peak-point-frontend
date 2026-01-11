<script lang="ts">
  import { onMount } from "svelte";

  import { currentCategories, currentPeaks, curentDataSets } from "$lib/runes.svelte";
  import {
    computePeaksByCategory,
    refreshPeakMap,
    refreshPeakState
  } from "$lib/services/peak-utils";

  import Card from "$lib/ui/Card.svelte";
  import LeafletMap from "$lib/ui/LeafletMap.svelte";
  import PeakSelectionList from "$lib/ui/PeakSelectionList.svelte";
  import PeakCard from "$lib/ui/PeakCard.svelte";

  import Chart from "svelte-frappe-charts";

  import type { Peak, StoredImage } from "$lib/types/peak-types";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  let map: LeafletMap;
  let mapReady = $state(false);

  let selectedPeak = $state<Peak | null>(null);

  function normalizeSelectedPeak(p: Peak): Peak {
    const imgs = (p.images ?? []) as StoredImage[];
    return { ...p, images: imgs };
  }

  function selectPeak(p: Peak) {
    selectedPeak = normalizeSelectedPeak(p);
    map?.moveTo(p.lat, p.lng).catch(console.log);
  }

  async function buildMap() {
    if (!mapReady) return;

    computePeaksByCategory(currentPeaks.peaks, currentCategories.categories);

    await map.clearOverlays();
    await map.clearMarkers();

    await refreshPeakMap(map, currentPeaks.peaks, currentCategories.categories, selectPeak);
  }

  function handleMapReady() {
    mapReady = true;
    buildMap().catch(console.log);

    if (selectedPeak) {
      map?.moveTo(selectedPeak.lat, selectedPeak.lng).catch(console.log);
    }
  }

  onMount(async () => {
    await refreshPeakState(data.peaks, data.categories);

    if (!selectedPeak && currentPeaks.peaks.length > 0) {
      selectPeak(currentPeaks.peaks[currentPeaks.peaks.length - 1]);
    }

    if (mapReady) {
      await buildMap();
    }
  });
</script>

<section class="section">
  <div class="container">
    <div class="columns is-align-items-stretch">
      <div class="column is-4 is-flex is-flex-direction-column">
        <div
          class="mb-5"
          style="height: 65vh; min-height: 0; display: flex; flex-direction: column;"
        >
          <Card title="Peaks">
            <div
              style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;"
            >
              <PeakSelectionList
                categories={currentCategories.categories}
                peaks={currentPeaks.peaks}
                selectedId={selectedPeak?._id}
                onSelect={selectPeak}
                maxHeightVh={65}
              />
            </div>
          </Card>
        </div>
      </div>

      <div class="column is-8 is-flex is-flex-direction-column">
        <div
          class="mb-5"
          style="height: 65vh; min-height: 0; display: flex; flex-direction: column;"
        >
          <Card title="Map">
            <LeafletMap height={65} bind:this={map} onReady={handleMapReady} />
          </Card>
        </div>
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
  </div>
</section>
