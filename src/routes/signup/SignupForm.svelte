<script lang="ts">
	import { goto } from "$app/navigation";
	import UserCredentials from "$lib/ui/UserCredentials.svelte";
	import UserDetails from "$lib/ui/UserDetails.svelte";
	import Message from "$lib/ui/Message.svelte";
	import { peakService } from '$lib/services/peak-service';

	let firstName = $state("");
	let lastName = $state("");
	let email = $state("");
	let password = $state("");
	let message = $state("");

	async function signup() {
		const success = await peakService.signup({ firstName, lastName, email, password });

		if (success) {
			goto("/login");
		} else {
			message = "Error trying to sign up";
		}
	}
</script>

<div class="box">
	{#if message}
		<Message {message} />
	{/if}
	<UserDetails bind:firstName bind:lastName />
	<UserCredentials bind:email bind:password />
	<button onclick={() => signup()} class="button">Sign Up</button>
	<p class="has-text-centered">
		Already have an account? <a href="/login" data-cy="login-redirect">Login Here</a>
	</p>
</div>
