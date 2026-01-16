<script lang="ts">
  const props = $props<{ values?: { email?: string } }>();
  const values = props.values ?? {};
</script>

<div class="field">
  <label class="label" for="email">Email</label>
  <div class="control has-icons-left">
    <input
      id="email"
      class="input"
      type="email"
      name="email"
      placeholder="Email"
      value={values.email ?? ""}
      required
      autocomplete="email"
    />
    <span class="icon is-small is-left"><i class="fa fa-envelope"></i></span>
  </div>
</div>

<div class="field">
  <label class="label" for="password">Password</label>
  <div class="control has-icons-left">
    <input
      id="password"
      class="input"
      type="password"
      name="password"
      placeholder="Password"
      required
      autocomplete="current-password"
    />
    <span class="icon is-small is-left"><i class="fa fa-key"></i></span>
  </div>
</div>
