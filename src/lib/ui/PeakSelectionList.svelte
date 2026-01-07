<script lang="ts">
	import type { Category, Peak } from "$lib/types/peak-types";

	const props = $props<{
		categories: Category[];
		peaks: Peak[];
		selectedId?: string;
		onSelect?: (peak: Peak) => void;
		maxHeightVh?: number;
	}>();

	const maxHeightVh = props.maxHeightVh ?? 42;

	const UNCATEGORIZED = "__none__";
	let openIds = $state<Set<string>>(new Set());

	function toggleCategory(id: string) {
		const next = new Set(openIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		openIds = next;
	}

	function categoryIdsOfPeak(p: Peak): string[] {
		const cats = p.categories;
		if (!cats) return [];

		if (Array.isArray(cats) && cats.every((c) => typeof c === "string")) return cats as string[];

		if (Array.isArray(cats) && cats.every((c) => typeof c === "object" && c !== null && "_id" in c)) {
			return (cats as { _id: string }[]).map((c) => c._id);
		}

		return [];
	}

	function peaksForCategory(categoryId: string): Peak[] {
		if (categoryId === UNCATEGORIZED) {
			return props.peaks.filter((p) => categoryIdsOfPeak(p).length === 0);
		}
		return props.peaks.filter((p) => categoryIdsOfPeak(p).includes(categoryId));
	}

	function select(e: MouseEvent, p: Peak) {
		e.preventDefault();
		props.onSelect?.(p);
	}
</script>

<div
	style={`max-height:${maxHeightVh}vh; overflow:auto; border: 1px solid #ededed; border-radius: 6px;`}
>
	{#if props.categories.length === 0}
		<div class="p-3">
			<p class="has-text-grey is-size-7">No categories available.</p>
		</div>
	{:else}
		{#each props.categories as c (c._id)}
			<!-- Category row -->
			<a
				href="#!"
				onclick={(e) => {
					e.preventDefault();
					toggleCategory(c._id);
				}}
				style="
					display:flex;
					align-items:center;
					justify-content:space-between;
					padding: 0.6rem 0.75rem;
					border-bottom: 1px solid #f1f1f1;
					color: #222;
					text-decoration:none;
					cursor:pointer;
				"
				class="has-text-weight-semibold"
			>
				<span style="display:flex; align-items:center; gap:0.5rem;">
					<span class="icon is-small has-text-grey">
						<i class={`fas ${openIds.has(c._id) ? "fa-angle-down" : "fa-angle-right"}`} aria-hidden="true"></i>
					</span>
					<span class="is-size-7" style="letter-spacing:0.01em;">{c.name}</span>
				</span>

				<span class="tag is-light is-size-7">{peaksForCategory(c._id).length}</span>
			</a>

			<!-- Peaks under category -->
			{#if openIds.has(c._id)}
				{#if peaksForCategory(c._id).length === 0}
					<div style="padding: 0.5rem 0.75rem; border-bottom: 1px solid #f7f7f7;">
						<p class="has-text-grey is-size-7">No peaks.</p>
					</div>
				{:else}
					{#each peaksForCategory(c._id) as p (c._id + "-" + p._id)}
						<a
							href="#"
							onclick={(e) => select(e, p)}
							style={`
								display:flex;
								align-items:center;
								justify-content:space-between;
								padding: 0.55rem 0.75rem 0.55rem 1.6rem;
								border-bottom: 1px solid #f7f7f7;
								color: ${props.selectedId === p._id ? "#0a58ca" : "#222"};
								background: ${props.selectedId === p._id ? "rgba(10, 88, 202, 0.06)" : "transparent"};
								text-decoration:none;
								cursor:pointer;
							`}
							onmouseenter={(e) => {
								const el = e.currentTarget as HTMLElement;
								if (props.selectedId !== p._id) el.style.background = "rgba(0,0,0,0.03)";
							}}
							onmouseleave={(e) => {
								const el = e.currentTarget as HTMLElement;
								if (props.selectedId !== p._id) el.style.background = "transparent";
							}}
						>
							<span style="display:flex; align-items:center; gap:0.5rem;">
								<span class="icon is-small has-text-grey">
									<i class="fas fa-mountain" aria-hidden="true"></i>
								</span>
								<span class="is-size-7">{p.name}</span>
							</span>

							<span class="tag is-light is-size-7">{p.elevation} m</span>
						</a>
					{/each}
				{/if}
			{/if}
		{/each}

		<!-- Uncategorized -->
		<a
			href="#!"
			onclick={(e) => {
				e.preventDefault();
				toggleCategory(UNCATEGORIZED);
			}}
			style="
				display:flex;
				align-items:center;
				justify-content:space-between;
				padding: 0.6rem 0.75rem;
				border-bottom: 1px solid #f1f1f1;
				color:#222;
				text-decoration:none;
				cursor:pointer;
			"
			class="has-text-weight-semibold"
		>
			<span style="display:flex; align-items:center; gap:0.5rem;">
				<span class="icon is-small has-text-grey">
					<i class={`fas ${openIds.has(UNCATEGORIZED) ? "fa-angle-down" : "fa-angle-right"}`} aria-hidden="true"></i>
				</span>
				<span class="is-size-7" style="letter-spacing:0.01em;">Uncategorized</span>
			</span>

			<span class="tag is-light is-size-7">{peaksForCategory(UNCATEGORIZED).length}</span>
		</a>

		{#if openIds.has(UNCATEGORIZED)}
			{#if peaksForCategory(UNCATEGORIZED).length === 0}
				<div style="padding: 0.5rem 0.75rem;">
					<p class="has-text-grey is-size-7">No peaks.</p>
				</div>
			{:else}
				{#each peaksForCategory(UNCATEGORIZED) as p ("none-" + p._id)}
					<a
						href="#"
						onclick={(e) => select(e, p)}
						style={`
							display:flex;
							align-items:center;
							justify-content:space-between;
							padding: 0.55rem 0.75rem 0.55rem 1.6rem;
							border-bottom: 1px solid #f7f7f7;
							color: ${props.selectedId === p._id ? "#0a58ca" : "#222"};
							background: ${props.selectedId === p._id ? "rgba(10, 88, 202, 0.06)" : "transparent"};
							text-decoration:none;
							cursor:pointer;
						`}
						onmouseenter={(e) => {
							const el = e.currentTarget as HTMLElement;
							if (props.selectedId !== p._id) el.style.background = "rgba(0,0,0,0.03)";
						}}
						onmouseleave={(e) => {
							const el = e.currentTarget as HTMLElement;
							if (props.selectedId !== p._id) el.style.background = "transparent";
						}}
					>
						<span style="display:flex; align-items:center; gap:0.5rem;">
							<span class="icon is-small has-text-grey">
								<i class="fas fa-mountain" aria-hidden="true"></i>
							</span>
							<span class="is-size-7">{p.name}</span>
						</span>

						<span class="tag is-light is-size-7">{p.elevation} m</span>
					</a>
				{/each}
			{/if}
		{/if}
	{/if}
</div>
