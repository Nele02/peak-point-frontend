<script lang="ts">
  import type { StoredImage } from "$lib/types/peak-types";

  const props = $props<{
    images?: StoredImage[];
    max?: number;
    peakName?: string;
  }>();

  const max = props.max ?? 10;

  const limited = $derived(() => {
    const imgs = props.images ?? [];
    return imgs.slice(0, max);
  });

  let index = $state(0);

  $effect(() => {
    const imgs = limited();
    if (index >= imgs.length) index = 0;
  });

  function prev() {
    const imgs = limited();
    if (imgs.length === 0) return;
    index = (index - 1 + imgs.length) % imgs.length;
  }

  function next() {
    const imgs = limited();
    if (imgs.length === 0) return;
    index = (index + 1) % imgs.length;
  }

  function altText(i: number) {
    const name = props.peakName ?? "Peak";
    return `${name} photo ${i + 1}`;
  }
</script>

{#if limited().length > 0}
  {#if limited().length === 1}
    <figure class="image is-4by3 mb-2">
      <img src={limited()[0].url} alt={altText(0)} style="object-fit: cover;" />
    </figure>
  {:else}
    <div>
      <figure class="image is-4by3 mb-2">
        <img src={limited()[index].url} alt={altText(index)} style="object-fit: cover;" />
      </figure>

      <div class="level is-mobile">
        <div class="level-left">
          <button
            class="button is-small is-light"
            type="button"
            onclick={prev}
            aria-label="Previous image"
            title="Previous image"
          >
            <span class="icon is-small"><i class="fas fa-chevron-left"></i></span>
          </button>

          <button
            class="button is-small is-light ml-2"
            type="button"
            onclick={next}
            aria-label="Next image"
            title="Next image"
          >
            <span class="icon is-small"><i class="fas fa-chevron-right"></i></span>
          </button>

          <span class="tag is-light ml-3">
            {index + 1} / {limited().length}
          </span>

          {#if (props.images ?? []).length > max}
            <span class="tag is-warning is-light ml-2" title="Only showing first images">
              First {max}
            </span>
          {/if}
        </div>
      </div>
    </div>
  {/if}
{/if}
