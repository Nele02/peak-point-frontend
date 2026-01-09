<script lang="ts">
	import { enhance } from "$app/forms";
	import Message from "$lib/ui/Message.svelte";
	import UserCredentials from "$lib/ui/UserCredentials.svelte";
	import { peakService } from "$lib/services/peak-service";

	let message = "";

	const callback = "http://localhost:5173/oauth/callback";
	const oauthGithubUrl = `${peakService.baseUrl}/api/oauth/github?redirectTo=${encodeURIComponent(callback)}`;
	const oauthGoogleUrl = `${peakService.baseUrl}/api/oauth/google?redirectTo=${encodeURIComponent(callback)}`;
</script>

{#if message}
	<Message {message} />
{/if}

<form method="POST" action="?/login" use:enhance>
	<UserCredentials />
	<button class="button is-success is-fullwidth">Log In</button>
</form>

<hr />

<div class="buttons is-flex is-flex-direction-column">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a class="button is-link is-fullwidth" href={oauthGoogleUrl} target="_blank" rel="noopener noreferrer">Login with Google</a>
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a class="button is-dark is-fullwidth" href={oauthGithubUrl} target="_blank" rel="noopener noreferrer">Login with GitHub</a>
</div>
