<script lang="ts">
  import Message from "$lib/ui/Message.svelte";
  export let data;
  export let form;

  const otpauthUrl = data.otpauthUrl;

  // use a free QR generator
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(otpauthUrl)}`;
</script>

<section class="section">
  <div class="container">
    <h1 class="title">Enable 2FA</h1>

    {#if form?.message}
      <Message message={form.message} />
    {/if}

    <div class="columns">
      <div class="column is-5">
        <div class="box">
          <p class="mb-3">
            1) Scan this QR code in your authenticator app (Google Authenticator, Authy, etc).
          </p>

          <figure class="image is-220x220">
            <img src={qrUrl} alt="2FA QR code" />
          </figure>

          <p class="help mt-3">2) Enter the 6-digit code to confirm.</p>
        </div>
      </div>

      <div class="column is-5">
        <div class="box">
          <form method="POST" action="?/verify">
            <div class="field">
              <label class="label">Authenticator code</label>
              <div class="control">
                <input
                  class="input"
                  name="code"
                  placeholder="123456"
                  autocomplete="one-time-code"
                />
              </div>
            </div>

            <button class="button is-link is-fullwidth" type="submit">Confirm & Enable</button>
          </form>

          <hr />

          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a class="button is-light is-fullwidth" href="/account">Cancel</a>
        </div>
      </div>
    </div>
  </div>
</section>
