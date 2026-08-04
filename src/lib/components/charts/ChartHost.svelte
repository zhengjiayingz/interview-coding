<script lang="ts">
	import * as echarts from 'echarts';
	import { onDestroy, onMount } from 'svelte';
	import type { EChartsOption } from 'echarts';

	interface Props {
		option: EChartsOption;
		height?: string;
	}

	let { option, height = '320px' }: Props = $props();

	let el: HTMLDivElement | undefined = $state();
	let chart: echarts.ECharts | undefined;

	onMount(() => {
		if (!el) return;
		chart = echarts.init(el);
		chart.setOption(option);

		const onResize = () => chart?.resize();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	$effect(() => {
		chart?.setOption(option, true);
	});

	onDestroy(() => {
		chart?.dispose();
		chart = undefined;
	});
</script>

<div bind:this={el} style:height class="w-full"></div>
