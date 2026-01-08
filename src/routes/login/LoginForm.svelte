<script lang="ts">
	import { enhance } from "$app/forms";
	import Message from "$lib/ui/Message.svelte";
	import UserCredentials from "$lib/ui/UserCredentials.svelte";

	let message = "";
</script>

{#if message}
	<Message {message} />
{/if}

<form method="POST" action="?/login" use:enhance>
	<UserCredentials />
	<button class="button is-success is-fullwidth">Log In</button>
</form>
