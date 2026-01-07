<script lang="ts">
	import type { Category } from "$lib/types/peak-types";

	type ApplyHandler = () => void;
	type ClearHandler = () => void;
	type ToggleHandler = (id: string) => void;

	const props = $props<{
		categories?: Category[];
		selected?: string[];
		onToggle?: ToggleHandler;
		onApply?: ApplyHandler;
		onClear?: ClearHandler;
	}>();

	let open = $state(false);

	let categories = $derived(props.categories ?? []);
	let selected = $derived(props.selected ?? []);

	function toggleDropdown() {
		open = !open;
	}

	function toggleCategory(id: string) {
		props.onToggle?.(id);
	}

	function apply() {
		props.onApply?.();
		open = false;
	}

	function clear() {
		props.onClear?.();
		open = false;
	}
</script>

<div class="box mb-5">
	<div class="level">
		<div class="level-left">
			<div class="level-item">
				<div>
					<p class="title is-5 mb-1">My Peaks</p>
				</div>
			</div>

			<div class="level-item">
				<div class={`dropdown ${open ? "is-active" : ""}`}>
					<div class="dropdown-trigger">
						<button class="button is-small" type="button" onclick={toggleDropdown} aria-haspopup="true">
							<span class="icon is-small"><i class="fas fa-tags"></i></span>
							<span>Categories</span>
							<span class="tag is-light ml-2">{selected.length}</span>
							<span class="icon is-small"><i class="fas fa-angle-down"></i></span>
						</button>
					</div>

					<div class="dropdown-menu" role="menu">
						<div class="dropdown-content" style="min-width: 260px;">
							<div class="dropdown-item">
								{#if categories.length === 0}
									<p class="has-text-grey">No categories.</p>
								{:else}
									{#each categories as c (c._id)}
										<label class="checkbox is-block mb-2">
											<input
												type="checkbox"
												checked={selected.includes(c._id)}
												onchange={() => toggleCategory(c._id)}
											/>
											<span class="ml-2">{c.name}</span>
										</label>
									{/each}
								{/if}

								<div class="buttons mt-3">
									<button class="button is-small is-light" type="button" onclick={clear}>
										Clear
									</button>
									<button class="button is-small is-link" type="button" onclick={apply}>
										Apply
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="level-right">
			<div class="level-item">
				<a class="button is-small is-link" href="/peaks/new">
					<span class="icon is-small"><i class="fas fa-plus"></i></span>
					<span>New Peak</span>
				</a>
			</div>
		</div>
	</div>
</div>
