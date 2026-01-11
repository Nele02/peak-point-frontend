<script lang="ts">
  import type { Category, Peak } from "$lib/types/peak-types";
  import Card from "$lib/ui/Card.svelte";
  import ImageCarousel from "$lib/ui/ImageCarousel.svelte";
  import { resolve } from "$app/paths";

  const props = $props<{ peak: Peak; showEdit?: boolean }>();
  const showEdit = props.showEdit ?? true;

  function isCategoryObjectArray(value: unknown): value is Category[] {
    return (
      Array.isArray(value) &&
      value.every((v) => typeof v === "object" && v !== null && "_id" in v && "name" in v)
    );
  }

  function categoryNames(): string[] {
    const p = props.peak;
    if (!p.categories) return [];

    if (Array.isArray(p.categories) && p.categories.every((c: unknown) => typeof c === "string")) {
      return p.categories as string[];
    }

    if (isCategoryObjectArray(p.categories)) {
      return p.categories.map((c: Category) => c.name);
    }
    return [];
  }
</script>

<div data-testid="peak-card" style="height: 100%;">
  <Card title={props.peak.name}>
    {#if props.peak.images && props.peak.images.length > 0}
      <div class="mb-4">
        <ImageCarousel images={props.peak.images} max={10} peakName={props.peak.name} />
      </div>
    {/if}

    <p class="mb-2">
      <span class="icon mr-1"><i class="fas fa-mountain"></i></span>
      <strong>{props.peak.elevation}</strong> m
    </p>

    {#if props.peak.description}
      <p class="has-text-grey mb-3">{props.peak.description}</p>
    {/if}

    <p class="is-size-7 has-text-grey mb-3">
      <span class="icon mr-1"><i class="fas fa-map-marker-alt"></i></span>
      {props.peak.lat}, {props.peak.lng}
    </p>

    {#if categoryNames().length > 0}
      <div class="tags">
        {#each categoryNames() as cn (cn)}
          <span class="tag is-info is-light">{cn}</span>
        {/each}
      </div>
    {/if}

    {#if showEdit}
      <div class="buttons mt-4">
        <a class="button is-small is-link is-light" href={resolve(`/peaks/${props.peak._id}/edit`)}>
          <span class="icon is-small"><i class="fas fa-edit"></i></span>
          <span>Edit</span>
        </a>
      </div>
    {/if}
  </Card>
</div>
