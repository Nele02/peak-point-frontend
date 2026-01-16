<script lang="ts">
  import type { Category, Peak, StoredImage } from "$lib/types/peak-types";

  const props = $props<{
    title: string;
    peak: Peak;
    categories: Category[];
    submitLabel?: string;
    onSubmit: (peak: Peak, newFiles: File[]) => Promise<void> | void;
    onCancel?: () => void;
  }>();

  const submitLabel = props.submitLabel ?? "Save";

  let saving = $state(false);
  let errorMsg = $state("");

  // field validation messages
  let fieldErrors = $state<Record<string, string>>({});

  function categoriesToIds(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value) && value.every((c) => typeof c === "string")) return value as string[];

    if (
      Array.isArray(value) &&
      value.every((c) => typeof c === "object" && c !== null && "_id" in c)
    ) {
      return (value as { _id: string }[]).map((c) => c._id);
    }

    return [];
  }

  let form = $state<Peak>({
    ...props.peak,
    images: (props.peak.images ?? []) as StoredImage[],
    categories: categoriesToIds(props.peak.categories)
  });

  let newFiles = $state<File[]>([]);
  let previewUrls = $state<string[]>([]);

  function isSelectedCategory(id: string) {
    const cats = (form.categories ?? []) as string[];
    return cats.includes(id);
  }

  function toggleCategory(id: string) {
    const current = (form.categories ?? []) as string[];
    form.categories = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  }

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    const existingCount = (form.images ?? []).length;
    const remaining = Math.max(0, 10 - existingCount - newFiles.length);

    const toAdd = files.slice(0, remaining);
    newFiles = [...newFiles, ...toAdd];
    previewUrls = [...previewUrls, ...toAdd.map((f) => URL.createObjectURL(f))];

    input.value = "";
  }

  function removeNewFile(i: number) {
    const url = previewUrls[i];
    if (url) URL.revokeObjectURL(url);

    newFiles = newFiles.filter((_, idx) => idx !== i);
    previewUrls = previewUrls.filter((_, idx) => idx !== i);
  }

  function removeExistingImage(i: number) {
    const imgs = (form.images ?? []) as StoredImage[];
    form.images = imgs.filter((_, idx) => idx !== i);
  }

  function safeString(v: unknown) {
    return typeof v === "string" ? v : v == null ? "" : String(v);
  }

  function toNumber(v: unknown): number {
    const n = typeof v === "number" ? v : Number(safeString(v));
    return Number.isFinite(n) ? n : NaN;
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};

    const trimmedName = safeString(form.name).trim();
    if (trimmedName.length === 0) {
      errs.name = "Name is required.";
    }

    const e = toNumber(form.elevation);
    if (Number.isNaN(e)) {
      errs.elevation = "Elevation is required.";
    } else if (!Number.isInteger(e)) {
      errs.elevation = "Elevation must be an integer (meters).";
    } else if (e < 1) {
      errs.elevation = "Elevation must be greater than 0.";
    }

    const la = toNumber(form.lat);
    if (Number.isNaN(la)) {
      errs.lat = "Latitude is required.";
    } else if (la < -90 || la > 90) {
      errs.lat = "Latitude must be between -90 and 90.";
    }

    const lo = toNumber(form.lng);
    if (Number.isNaN(lo)) {
      errs.lng = "Longitude is required.";
    } else if (lo < -180 || lo > 180) {
      errs.lng = "Longitude must be between -180 and 180.";
    }

    fieldErrors = errs;
    return Object.keys(errs).length === 0;
  }

  function normalizeBackendError(e: unknown): string {
    const fallback = "Saving failed. Please try again.";

    if (e instanceof Error) return e.message;

    if (typeof e === "object" && e !== null) {
      const obj = e as Record<string, unknown>;
      const response = obj.response as Record<string, unknown> | undefined;
      const data = response?.data as Record<string, unknown> | undefined;

      const msg = data?.message;
      if (typeof msg === "string" && msg.trim().length > 0) return msg;

      const details = data?.details;
      if (Array.isArray(details) && details.length > 0) {
        const strings = details.filter((d): d is string => typeof d === "string");
        if (strings.length > 0)
          return `${typeof msg === "string" ? msg : "Validation error"}: ${strings.slice(0, 4).join(" ")}`;
      }
    }

    return fallback;
  }

  async function submit() {
    try {
      errorMsg = "";
      fieldErrors = {};

      if (!validate()) {
        errorMsg = "Please fix the highlighted fields.";
        return;
      }

      const payload: Peak = {
        ...form,
        name: safeString(form.name).trim(),
        elevation: Number.parseInt(safeString(form.elevation), 10),
        lat: toNumber(form.lat),
        lng: toNumber(form.lng)
      };

      saving = true;
      await props.onSubmit(payload, newFiles);
    } catch (e) {
      errorMsg = normalizeBackendError(e);
    } finally {
      saving = false;
    }
  }

  // cleanup preview URLs
  $effect(() => {
    return () => {
      for (const url of previewUrls) URL.revokeObjectURL(url);
    };
  });
</script>

<div class="box">
  <h1 class="title is-4">{props.title}</h1>

  {#if errorMsg}
    <article class="message is-danger">
      <div class="message-body">{errorMsg}</div>
    </article>
  {/if}

  <div class="field">
    <label class="label" for="name">Name *</label>
    <div class="control">
      <input
        id="name"
        class="input {fieldErrors.name ? 'is-danger' : ''}"
        type="text"
        bind:value={form.name}
        placeholder="e.g. Brocken"
        required
        minlength="1"
      />
    </div>
    {#if fieldErrors.name}
      <p class="help is-danger">{fieldErrors.name}</p>
    {/if}
  </div>

  <div class="field">
    <label class="label" for="elevation">Elevation (m) *</label>
    <div class="control">
      <input
        id="elevation"
        class="input {fieldErrors.elevation ? 'is-danger' : ''}"
        type="number"
        bind:value={form.elevation}
        placeholder="e.g. 1141"
        required
        min="1"
        step="1"
      />
    </div>
    {#if fieldErrors.elevation}
      <p class="help is-danger">{fieldErrors.elevation}</p>
    {/if}
  </div>

  <div class="field">
    <label class="label" for="desc">Description</label>
    <div class="control">
      <textarea id="desc" class="textarea" bind:value={form.description} placeholder="Short note..."
      ></textarea>
    </div>
  </div>

  <div class="columns">
    <div class="column">
      <div class="field">
        <label class="label" for="lat">Lat *</label>
        <div class="control">
          <input
            id="lat"
            class="input {fieldErrors.lat ? 'is-danger' : ''}"
            type="number"
            step="any"
            min="-90"
            max="90"
            bind:value={form.lat}
            required
            placeholder="e.g. 47.4215"
          />
        </div>
        {#if fieldErrors.lat}
          <p class="help is-danger">{fieldErrors.lat}</p>
        {/if}
      </div>
    </div>
    <div class="column">
      <div class="field">
        <label class="label" for="lng">Lng *</label>
        <div class="control">
          <input
            id="lng"
            class="input {fieldErrors.lng ? 'is-danger' : ''}"
            type="number"
            step="any"
            min="-180"
            max="180"
            bind:value={form.lng}
            required
            placeholder="e.g. 11.9842"
          />
        </div>
        {#if fieldErrors.lng}
          <p class="help is-danger">{fieldErrors.lng}</p>
        {/if}
      </div>
    </div>
  </div>

  <hr />

  <div class="field">
    <label class="label" for="categories">Categories</label>

    <fieldset id="categories" class="is-sr-only" aria-hidden="true"></fieldset>

    {#if props.categories.length === 0}
      <p class="has-text-grey">No categories available.</p>
    {:else}
      <div class="columns is-multiline">
        {#each props.categories as c (c._id)}
          <div class="column is-half">
            <label class="checkbox">
              <input
                type="checkbox"
                checked={isSelectedCategory(c._id)}
                onchange={() => toggleCategory(c._id)}
              />
              <span class="ml-2">{c.name}</span>
            </label>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <hr />

  <div class="field">
    <label class="label" for="imgs">Images (max 10)</label>
    <div class="control">
      <input
        id="imgs"
        class="input"
        type="file"
        accept="image/*"
        multiple
        onchange={onFileChange}
        disabled={(form.images?.length ?? 0) + newFiles.length >= 10}
      />
    </div>

    <p class="help">Selected: {(form.images?.length ?? 0) + newFiles.length} / 10</p>
  </div>

  {#if (form.images?.length ?? 0) > 0}
    <div class="mb-4">
      <p class="has-text-grey is-size-7 mb-2">Existing images</p>
      <div class="columns is-multiline is-mobile">
        {#each form.images ?? [] as img, i (img.publicId ?? img.url)}
          <div class="column is-one-quarter">
            <figure class="image is-128x128">
              <img src={img.url} alt={`Existing photo ${i + 1}`} style="object-fit: cover;" />
            </figure>
            <button
              class="button is-small is-light mt-2"
              type="button"
              onclick={() => removeExistingImage(i)}
              disabled={saving}
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if newFiles.length > 0}
    <div class="mb-4">
      <p class="has-text-grey is-size-7 mb-2">New uploads</p>
      <div class="columns is-multiline is-mobile">
        {#each previewUrls as url, i (url)}
          <div class="column is-one-quarter">
            <figure class="image is-128x128">
              <img src={url} alt={`New upload ${i + 1}`} style="object-fit: cover;" />
            </figure>
            <button
              class="button is-small is-light mt-2"
              type="button"
              onclick={() => removeNewFile(i)}
              disabled={saving}
            >
              Remove
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="buttons mt-5">
    <button
      class={`button is-link ${saving ? "is-loading" : ""}`}
      type="button"
      onclick={submit}
      disabled={saving}
    >
      {submitLabel}
    </button>
    <button class="button is-light" type="button" onclick={props.onCancel} disabled={saving}>
      Cancel
    </button>
  </div>
</div>
