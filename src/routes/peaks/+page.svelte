<script lang="ts">
	import { subTitle } from "$lib/runes.svelte";
	import Card from '$lib/ui/Card.svelte';
	import { onMount } from 'svelte';
	subTitle.text = "Peaks";

	onMount(async () => {
		console.log("Peak Page")
	});
</script>


<Card title="Peaks">
	<p>Track Peaks here...</p>
</Card>