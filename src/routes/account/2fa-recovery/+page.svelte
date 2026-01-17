<script lang="ts">
  export let data;
  const codes: string[] = data.recoveryCodes ?? [];
</script>

<section class="section">
  <div class="container">
    <h1 class="title">Recovery codes</h1>

    <div class="notification is-warning">Save these codes now. You will not see them again.</div>

    <div class="box">
      <ul>
        {#each codes as c (c)}
          <li><code>{c}</code></li>
        {/each}
      </ul>
    </div>

    <form method="POST" action="?/done">
      <button class="button is-success">I saved them</button>
    </form>
  </div>
</section>
