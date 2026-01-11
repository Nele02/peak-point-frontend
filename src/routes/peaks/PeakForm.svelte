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

	async function submit() {
		try {
			errorMsg = "";
			saving = true;
			await props.onSubmit(form, newFiles);
		} catch (e) {
			console.log(e);
			errorMsg = "Saving failed. Please try again.";
		} finally {
			saving = false;
		}
	}
</script>

<div class="box">
	<h1 class="title is-4">{props.title}</h1>

	{#if errorMsg}
		<div class="notification is-danger is-light">{errorMsg}</div>
	{/if}

	<div class="field">
		<label class="label" for="name">Name</label>
		<div class="control">
			<input id="name" class="input" type="text" bind:value={form.name} placeholder="e.g. Brocken" />
		</div>
	</div>

	<div class="field">
		<label class="label" for="elevation">Elevation (m)</label>
		<div class="control">
			<input id="elevation" class="input" type="number" bind:value={form.elevation} placeholder="e.g. 1141" />
		</div>
	</div>

	<div class="field">
		<label class="label" for="desc">Description</label>
		<div class="control">
			<textarea id="desc" class="textarea" bind:value={form.description} placeholder="Short note..."></textarea>
		</div>
	</div>

	<div class="columns">
		<div class="column">
			<div class="field">
				<label class="label" for="lat">Lat</label>
				<div class="control">
					<input id="lat" class="input" type="number" step="any" bind:value={form.lat} />
				</div>
			</div>
		</div>
		<div class="column">
			<div class="field">
				<label class="label" for="lng">Lng</label>
				<div class="control">
					<input id="lng" class="input" type="number" step="any" bind:value={form.lng} />
				</div>
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
							<input type="checkbox" checked={isSelectedCategory(c._id)} onchange={() => toggleCategory(c._id)} />
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
				{#each (form.images ?? []) as img, i (img.publicId ?? img.url)}
					<div class="column is-one-quarter">
						<figure class="image is-128x128">
							<img src={img.url} alt={`Existing photo ${i + 1}`} style="object-fit: cover;" />
						</figure>
						<button class="button is-small is-light mt-2" type="button" onclick={() => removeExistingImage(i)}>
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
						<button class="button is-small is-light mt-2" type="button" onclick={() => removeNewFile(i)}>
							Remove
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="buttons mt-5">
		<button class={`button is-link ${saving ? "is-loading" : ""}`} type="button" onclick={submit} disabled={saving}>
			{submitLabel}
		</button>
		<button class="button is-light" type="button" onclick={props.onCancel} disabled={saving}>
			Cancel
		</button>
	</div>
</div>
