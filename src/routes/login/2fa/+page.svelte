<script lang="ts">
  export let form;
</script>

<section class="hero is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="column is-4 is-offset-4">
        <h3 class="title has-text-black has-text-centered">Two-Factor Login</h3>

        {#if form?.message}
          <div class="notification is-danger" role="alert">{form.message}</div>
        {/if}

        <form method="POST" action="?/verify">
          <div class="field">
            <label class="label" for="auth-code">Authenticator code</label>
            <div class="control">
              <input
                class="input"
                id="auth-code"
                name="code"
                placeholder="123456"
                autocomplete="one-time-code"
                inputmode="numeric"
                autocapitalize="none"
                spellcheck="false"
              />
            </div>
            <p class="help">Use this if you have your authenticator app.</p>
          </div>

          <div class="field">
            <label class="label" for="recovery-code">Recovery code</label>
            <div class="control">
              <input
                class="input"
                id="recovery-code"
                name="recoveryCode"
                placeholder="abcd-1234"
                autocapitalize="none"
                spellcheck="false"
              />
            </div>
            <p class="help">Use a recovery code if you lost your app.</p>
          </div>

          <button class="button is-link is-fullwidth" type="submit">Verify</button>
        </form>

        <hr />

        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a class="button is-light is-fullwidth" href="/login">Back to login</a>
      </div>
    </div>
  </div>
</section>
