<script lang="ts">
	import { enhance } from "$app/forms";
	import Message from "$lib/ui/Message.svelte";
	import UserCredentials from "$lib/ui/UserCredentials.svelte";
	import UserDetails from "$lib/ui/UserDetails.svelte";

	const props = $props<{ form?: { message?: string } }>();
	const message = $derived(props.form?.message ?? "");
</script>

<div class="box">
	{#if message}
		<Message {message} />
	{/if}

	<form method="POST" action="?/signup" use:enhance>
		<UserDetails />
		<UserCredentials />

		<button class="button is-link is-fullwidth" type="submit">Sign Up</button>
	</form>

	<p class="has-text-centered mt-3">
		Already have an account? <a href="/login" data-cy="login-redirect">Login Here</a>
	</p>
</div>
