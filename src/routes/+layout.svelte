<script lang="ts">
	import { loggedInUser } from "$lib/runes.svelte";
	import Heading from "$lib/ui/Heading.svelte";
	import Menu from "$lib/ui/Menu.svelte";
	import { onMount } from 'svelte';
	import { peakService } from '$lib/services/peak-service';

	onMount(async () => {
		await peakService.restoreSession();
	});

</script>

<div class="container">
	{#if loggedInUser.email}
		<Menu />
		<Heading />
	{/if}
	<slot />
</div>
