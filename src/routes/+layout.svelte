<script lang="ts">
	import { onMount } from "svelte";
	import Menu from "$lib/ui/Menu.svelte";
	import { peakService } from "$lib/services/peak-service";
	import { loggedInUser, sessionChecked } from "$lib/runes.svelte";

	onMount(async () => {
		if (!sessionChecked.done) {
			await peakService.restoreSession();
		}
	});
</script>

<div class="container">
	{#if loggedInUser.token}
		<Menu />
	{/if}
	<slot />
</div>
