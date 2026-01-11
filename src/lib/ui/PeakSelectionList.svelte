<script module lang="ts">
  import type { Category, Peak } from "$lib/types/peak-types";

  export interface Props {
    categories: Category[];
    peaks: Peak[];
    selectedId?: string;
    onSelect?: (peak: Peak) => void;
    maxHeightVh?: number;
  }
</script>

<script lang="ts">
  let { categories, peaks, selectedId, onSelect, maxHeightVh = undefined } = $props();

  const UNCATEGORIZED = "__none__";
  let openIds = $state<Set<string>>(new Set());

  let containerStyle = $derived(
    typeof maxHeightVh === "number" ? `max-height:${maxHeightVh}vh;` : "height:100%;"
  );

  function toggleCategory(id: string) {
    openIds = (() => {
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const next = new Set(openIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    })();
  }

  function categoryIdsOfPeak(p: Peak): string[] {
    const cats = (p as unknown as { categories?: unknown }).categories;
    if (!cats) return [];

    if (Array.isArray(cats) && cats.every((c) => typeof c === "string")) return cats as string[];

    if (
      Array.isArray(cats) &&
      cats.every(
        (c) => typeof c === "object" && c !== null && "_id" in (c as Record<string, unknown>)
      )
    ) {
      return (cats as { _id: string }[]).map((c) => c._id);
    }

    return [];
  }

  function peaksForCategory(categoryId: string): Peak[] {
    if (categoryId === UNCATEGORIZED) {
      return peaks.filter((p: Peak) => categoryIdsOfPeak(p).length === 0);
    }
    return peaks.filter((p: Peak) => categoryIdsOfPeak(p).includes(categoryId));
  }

  function select(p: Peak) {
    onSelect?.(p);
  }
</script>

<div class="pp-list" style={containerStyle}>
  {#if categories.length === 0}
    <div class="pp-empty">
      <p class="has-text-grey is-size-7">No categories available.</p>
    </div>
  {:else}
    {#each categories as c (c._id)}
      <button
        type="button"
        class="pp-cat has-text-weight-semibold"
        onclick={() => toggleCategory(c._id)}
      >
        <span class="pp-cat-left">
          <span class="icon is-small has-text-grey">
            <i
              class={`fas ${openIds.has(c._id) ? "fa-angle-down" : "fa-angle-right"}`}
              aria-hidden="true"
            ></i>
          </span>
          <span class="is-size-7 pp-cat-name">{c.name}</span>
        </span>

        <span class="tag is-light is-size-7">{peaksForCategory(c._id).length}</span>
      </button>

      {#if openIds.has(c._id)}
        {#if peaksForCategory(c._id).length === 0}
          <div class="pp-none">
            <p class="has-text-grey is-size-7">No peaks.</p>
          </div>
        {:else}
          {#each peaksForCategory(c._id) as p (c._id + "-" + p._id)}
            <button
              type="button"
              class="pp-peak {selectedId === p._id ? 'is-selected' : ''}"
              onclick={() => select(p)}
            >
              <span class="pp-peak-left">
                <span class="icon is-small has-text-grey">
                  <i class="fas fa-mountain" aria-hidden="true"></i>
                </span>
                <span class="is-size-7">{p.name}</span>
              </span>

              <span class="tag is-light is-size-7">{p.elevation} m</span>
            </button>
          {/each}
        {/if}
      {/if}
    {/each}

    <button
      type="button"
      class="pp-cat has-text-weight-semibold"
      onclick={() => toggleCategory(UNCATEGORIZED)}
    >
      <span class="pp-cat-left">
        <span class="icon is-small has-text-grey">
          <i
            class={`fas ${openIds.has(UNCATEGORIZED) ? "fa-angle-down" : "fa-angle-right"}`}
            aria-hidden="true"
          ></i>
        </span>
        <span class="is-size-7 pp-cat-name">Uncategorized</span>
      </span>

      <span class="tag is-light is-size-7">{peaksForCategory(UNCATEGORIZED).length}</span>
    </button>

    {#if openIds.has(UNCATEGORIZED)}
      {#if peaksForCategory(UNCATEGORIZED).length === 0}
        <div class="pp-none">
          <p class="has-text-grey is-size-7">No peaks.</p>
        </div>
      {:else}
        {#each peaksForCategory(UNCATEGORIZED) as p ("none-" + p._id)}
          <button
            type="button"
            class="pp-peak {selectedId === p._id ? 'is-selected' : ''}"
            onclick={() => select(p)}
          >
            <span class="pp-peak-left">
              <span class="icon is-small has-text-grey">
                <i class="fas fa-mountain" aria-hidden="true"></i>
              </span>
              <span class="is-size-7">{p.name}</span>
            </span>

            <span class="tag is-light is-size-7">{p.elevation} m</span>
          </button>
        {/each}
      {/if}
    {/if}
  {/if}
</div>

<style>
  .pp-list {
    overflow: auto;
    border: 1px solid #ededed;
    border-radius: 6px;
  }

  .pp-empty {
    padding: 0.75rem;
  }

  .pp-cat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid #f1f1f1;
    color: #222;
    text-decoration: none;
    cursor: pointer;
    width: 100%;
    background: transparent;
    border: 0;
    text-align: left;
  }

  .pp-cat-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pp-cat-name {
    letter-spacing: 0.01em;
  }

  .pp-none {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #f7f7f7;
  }

  .pp-peak {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.55rem 0.75rem 0.55rem 1.6rem;
    border-bottom: 1px solid #f7f7f7;
    color: #222;
    text-decoration: none;
    cursor: pointer;
    background: transparent;
    width: 100%;
    border: 0;
    text-align: left;
  }

  .pp-peak:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .pp-peak.is-selected {
    color: #0a58ca;
    background: rgba(10, 88, 202, 0.06);
  }

  .pp-peak.is-selected:hover {
    background: rgba(10, 88, 202, 0.06);
  }

  .pp-peak-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
