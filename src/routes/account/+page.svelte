<script lang="ts">
  import Message from "$lib/ui/Message.svelte";

  export let data;
  export let form;

  const user = data.user;
</script>

<section class="section">
  <div class="container">
    <h1 class="title">Account</h1>

    {#if form?.message}
      <Message message={form.message} />
    {/if}

    <div class="box">
      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <hr />

      <h2 class="subtitle">Two-Factor Authentication</h2>

      {#if user.twoFactorEnabled}
        <div class="notification is-success">2FA is enabled</div>

        <p class="help">
          If you lose access to your authenticator app, you can still log in with a recovery code.
        </p>
      {:else}
        <div class="notification is-warning">2FA is not enabled.</div>

        <form method="POST" action="?/enable2fa">
          <button class="button is-link" type="submit">Enable 2FA</button>
        </form>
      {/if}
    </div>
  </div>
</section>
