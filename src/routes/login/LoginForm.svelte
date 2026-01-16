<script lang="ts">
  import Message from "$lib/ui/Message.svelte";
  import UserCredentials from "$lib/ui/UserCredentials.svelte";

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
