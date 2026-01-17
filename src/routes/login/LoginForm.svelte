<script lang="ts">
  import Message from "$lib/ui/Message.svelte";
  import UserCredentials from "$lib/ui/UserCredentials.svelte";
  import { peakService } from "$lib/services/peak-service";

  const props = $props<{ form?: unknown }>();

  const f = $derived(
    (props.form ?? {}) as {
      message?: string;
      errors?: Record<string, string>;
      values?: { email?: string };
    }
  );

  const message = $derived(f.message ?? "");
  const errors = $derived(f.errors ?? {});
  const values = $derived(f.values ?? {});

  const oauthGithubUrl = `${peakService.baseUrl}/api/oauth/github`;
  const oauthGoogleUrl = `${peakService.baseUrl}/api/oauth/google`;
</script>

<div class="box">
  {#if message}
    <Message {message} />
  {/if}

  <form method="POST" action="?/login">
    <UserCredentials {errors} {values} />
    <button class="button is-success is-fullwidth" type="submit">Log In</button>
  </form>
</div>

<hr />

<div class="buttons is-flex is-flex-direction-column">
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a class="button is-link is-fullwidth" href={oauthGoogleUrl}>Login with Google</a>
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a class="button is-dark is-fullwidth" href={oauthGithubUrl}>Login with GitHub</a>
</div>
