<script lang="ts">
	import { onMount, onDestroy } from "svelte";

	export type ChartType = "bar" | "line" | "pie";

	export type DataSet = {
		labels: string[];
		datasets: Array<{ values: number[] }>;
	};

	let {
		type,
		data,
		height = 240,
		isNavigable = false,
		onSelect
	} = $props<{
		type: ChartType;
		data: DataSet;
		height?: number;
		isNavigable?: boolean;
		onSelect?: (index: number) => void;
	}>();

	let host: HTMLDivElement | null = null;

	type FrappeChartInstance = {
		update: (d: DataSet) => void;
	};

	let chart: FrappeChartInstance | null = null;

	function safeData(d: DataSet): DataSet {
		// Frappe Charts mag keine leeren / mismatched Arrays → dann gibt's NaN SVG
		if (!d.labels || d.labels.length === 0) {
			return { labels: ["No data"], datasets: [{ values: [0] }] };
		}

		const values = d.datasets?.[0]?.values ?? [];
		if (values.length !== d.labels.length) {
			// normalize
			const normalized = d.labels.map((_, i) => (Number.isFinite(values[i]) ? values[i] : 0));
			return { labels: d.labels, datasets: [{ values: normalized }] };
		}

		return {
			labels: d.labels,
			datasets: [{ values: values.map((v) => (Number.isFinite(v) ? v : 0)) }]
		};
	}

	function handleDataSelect(ev: Event) {
		const anyEv = ev as unknown as { index?: unknown };
		if (typeof anyEv.index === "number") onSelect?.(anyEv.index);
	}

	onMount(async () => {
		if (!host) return;

		const mod = await import("frappe-charts");
		const ChartCtor = (mod as unknown as { Chart: new (opts: unknown) => FrappeChartInstance }).Chart;

		const initial = safeData(data);

		chart = new ChartCtor({
			parent: host,
			data: initial,
			type,
			height,
			isNavigable
		});

		if (isNavigable) host.addEventListener("data-select", handleDataSelect);
	});

	$effect(() => {
		if (!chart) return;
		chart.update(safeData(data));
	});

	onDestroy(() => {
		if (host && isNavigable) host.removeEventListener("data-select", handleDataSelect);
		chart = null;
	});
</script>

<div bind:this={host}></div>
