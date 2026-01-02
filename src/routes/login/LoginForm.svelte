<script lang="ts">
	import { goto } from "$app/navigation";
	import Message from "$lib/ui/Message.svelte";
	import UserCredentials from "$lib/ui/UserCredentials.svelte";
	import { peakService } from "$lib/services/peak-service";

	let email = $state("");
	let password = $state("");
	let message = $state("");

	async function login() {
		console.log(`attempting to log in email: ${email} with password: ${password}`);
		let session = await peakService.login(email, password);
		if (session) {
			goto("/peaks");
		} else {
			email = "";
			password = "";
			message = "Invalid Credentials";
		}
	}
</script>

{#if message}
	<Message {message} />
{/if}
<form onsubmit={login}>
	<UserCredentials bind:email bind:password />
	<button class="button is-success is-fullwidth">Log In</button>
</form>
