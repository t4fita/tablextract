<script lang="ts">
	import '../app.css';
	import MainLayout from '$lib/components/layout/MainLayout.svelte';
	let { children } = $props();
</script>

<MainLayout>
	{@render children()}
</MainLayout>
