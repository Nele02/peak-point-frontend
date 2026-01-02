<script lang="ts">
	import { goto } from "$app/navigation";
	import { peakService } from '$lib/services/peak-service';

	peakService.clearSession();
	goto("/");
</script>
