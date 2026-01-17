<script lang="ts">
  const props = $props<{
    values?: { email?: string };
    errors?: { email?: string; password?: string };
  }>();

  const values = props.values ?? {};
  const errors = props.errors ?? {};
</script>

<div class="field">
  <label class="label" for="email">Email</label>
  <div class="control has-icons-left">
    <input
      id="email"
      class="input {errors.email ? 'is-danger' : ''}"
      type="email"
      name="email"
      placeholder="Email"
      value={values.email ?? ""}
      required
      autocomplete="email"
    />
    <span class="icon is-small is-left"><i class="fa fa-envelope"></i></span>
  </div>
  {#if errors.email}
    <p class="help is-danger">{errors.email}</p>
  {/if}
</div>

<div class="field">
  <label class="label" for="password">Password</label>
  <div class="control has-icons-left">
    <input
      id="password"
      class="input {errors.password ? 'is-danger' : ''}"
      type="password"
      name="password"
      placeholder="Password"
      required
      autocomplete="current-password"
    />
    <span class="icon is-small is-left"><i class="fa fa-key"></i></span>
  </div>
  {#if errors.password}
    <p class="help is-danger">{errors.password}</p>
  {/if}
</div>
