<script lang="ts">
  import Message from "$lib/ui/Message.svelte";
  import UserCredentials from "$lib/ui/UserCredentials.svelte";
  import UserDetails from "$lib/ui/UserDetails.svelte";

  const props = $props<{ form?: unknown }>();

  const f = $derived(
    (props.form ?? {}) as {
      message?: string;
      values?: { firstName?: string; lastName?: string; email?: string };
    }
  );

  const message = $derived(f.message ?? "");
  const values = $derived(f.values ?? {});
</script>

<div class="box">
  {#if message}
    <Message {message} />
  {/if}

  <form method="POST" action="?/signup">
    <UserDetails {values} />
    <UserCredentials {values} />
    <button class="button is-success is-fullwidth" type="submit">Sign Up</button>
  </form>
</div>

<p class="has-text-centered">
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a href="/login">Already have an account? Login</a>
</p>
