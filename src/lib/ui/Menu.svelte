<script lang="ts">
	import { loggedInUser } from "$lib/runes.svelte";
</script>

<nav class="navbar is-full-width">
	<div class="container">
		<div class="navbar-brand">
			<a class="navbar-item" href="/dashboard">
				<span class="icon"> <i class="fas fa-mountain"></i></span><span class="icon mr-1"></span>
				<span><strong>Peak Point</strong> </span>
			</a>
		</div>
		<div id="navbarMenu" class="navbar-menu">
			<div class="navbar-end">
				<a class="navbar-item" href="/dashboard"> Dashboard </a>
				<a class="navbar-item" href="/peaks"> Peaks </a>
				<a class="navbar-item" href="/maps"> Maps </a>
				<form method="POST" action="/logout" class="navbar-item">
					<button type="submit" class="navbar-item">
						Logout [{loggedInUser.name}]
					</button>
				</form>

			</div>
			<div></div>
		</div>
	</div>
</nav>
