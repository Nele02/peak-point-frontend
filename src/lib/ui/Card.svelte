<script lang="ts">
	let { title = "", children } = $props();
</script>

<div class="card mb-5" style="height: 100%; display: flex; flex-direction: column;">
	<header class="card-header">
		<p class="card-header-title">
			<span>{title}</span>
		</p>
	</header>

	<div class="card-content" style="flex: 1;">
		<div class="content">
			{@render children()}
		</div>
	</div>
</div>
