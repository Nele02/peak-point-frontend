<script lang="ts">
  import SignupForm from "./SignupForm.svelte";
  export let form;
</script>

<section class="hero is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="column is-5 is-offset-4">
        <h3 class="title has-text-black has-text-centered">Create your account</h3>
        <SignupForm {form} />
      </div>
    </div>
  </div>
</section>
