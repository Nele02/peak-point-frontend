<script lang="ts">
  import LoginForm from "./LoginForm.svelte";
  export let form;
</script>

<section class="hero is-fullheight">
  <div class="hero-body">
    <div class="container">
      <div class="column is-4 is-offset-4">
        <h3 class="title has-text-black has-text-centered">Login to Peak Point</h3>
        <LoginForm {form} />
      </div>
    </div>
  </div>
</section>
