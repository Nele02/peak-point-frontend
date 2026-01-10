<script lang="ts">
	import Menu from "$lib/ui/Menu.svelte";
	import { loggedInUser } from "$lib/runes.svelte";

	const { data, children } = $props();

	$effect(() => {
		const s = data?.session;

		if (s) {
			loggedInUser.email = s.email;
			loggedInUser.name = s.name;
			loggedInUser.token = s.token;
			loggedInUser._id = s._id;
		} else {
			loggedInUser.email = "";
			loggedInUser.name = "";
			loggedInUser.token = "";
			loggedInUser._id = "";
		}
	});
</script>

<div class="container">
	{#if data?.session}
		<Menu />
	{/if}
	{@render children()}
</div>
