<script lang="ts">
  const props = $props<{ values?: { firstName?: string; lastName?: string } }>();
  const values = props.values ?? {};
</script>

<div class="field">
  <label class="label" for="firstName">First name</label>
  <div class="control">
    <input
      id="firstName"
      class="input"
      type="text"
      name="firstName"
      placeholder="First name"
      value={values.firstName ?? ""}
      required
      autocomplete="given-name"
    />
  </div>
</div>

<div class="field">
  <label class="label" for="lastName">Last name</label>
  <div class="control">
    <input
      id="lastName"
      class="input"
      type="text"
      name="lastName"
      placeholder="Last name"
      value={values.lastName ?? ""}
      required
      autocomplete="family-name"
    />
  </div>
</div>
