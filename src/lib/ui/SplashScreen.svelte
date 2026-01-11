<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<section class="hero is-fullheight is-default is-bold">
  <div class="hero-body">
    <div class="container has-text-centered">
      <div class="columns is-vcentered is-centered">
        <div class="column is-8">
          <h1 class="title is-2 mb-5">
            <span class="icon mr-4"><i class="fas fa-mountain"></i></span>
            PeakPoint
          </h1>
          <h2 class="subtitle is-4 mt-2">Track your peaks.</h2>

          <div class="buttons is-centered mt-5">
            <a class="button is-medium is-success" href={resolve("/signup")}>
              <span class="icon"><i class="fas fa-user-plus"></i></span>
              <span>Sign Up</span>
            </a>

            <a class="button is-medium is-link" href={resolve("/login")}>
              <span class="icon"><i class="fas fa-sign-in-alt"></i></span>
              <span>Login</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
