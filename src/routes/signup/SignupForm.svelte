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
