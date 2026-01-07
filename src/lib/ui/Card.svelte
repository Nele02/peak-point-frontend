<script lang="ts">
	let { title = "", children } = $props();
</script>

<div class="card" style="flex: 1; min-height: 0; display: flex; flex-direction: column;">
	<header class="card-header">
		<p class="card-header-title">
			<span>{title}</span>
		</p>
	</header>

	<div class="card-content" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
		<div class="content" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
			{@render children()}
		</div>
	</div>
</div>
