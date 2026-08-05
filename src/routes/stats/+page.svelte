<script lang="ts">
	import ChartHost from '$lib/components/charts/ChartHost.svelte';
	import { mockStats } from '$lib/mock/stats';
	import type { EChartsOption } from 'echarts';

	const palette = ['#0f766e', '#1a4547', '#b45309', '#59a9a1', '#0b2e2f'];

	const axisStyle = {
		axisLabel: { color: '#1a4547' },
		axisLine: { lineStyle: { color: 'rgba(11,46,47,0.15)' } },
		splitLine: { lineStyle: { color: 'rgba(11,46,47,0.06)' } }
	};

	const byCourseOption: EChartsOption = {
		color: palette,
		title: { text: '各课程报名量', textStyle: { color: '#0b2e2f', fontWeight: 600 } },
		tooltip: {},
		grid: { left: 40, right: 20, top: 56, bottom: 40 },
		xAxis: {
			type: 'category',
			data: mockStats.byCourse.map((i) => i.name),
			...axisStyle
		},
		yAxis: { type: 'value', ...axisStyle },
		series: [
			{
				type: 'bar',
				data: mockStats.byCourse.map((i) => i.count),
				itemStyle: { borderRadius: [8, 8, 0, 0] },
				barWidth: 36
			}
		]
	};

	const byModeOption: EChartsOption = {
		color: palette,
		title: { text: '线上 / 线下占比', textStyle: { color: '#0b2e2f', fontWeight: 600 } },
		tooltip: { trigger: 'item' },
		series: [
			{
				type: 'pie',
				radius: ['42%', '68%'],
				data: mockStats.byMode.map((i) => ({ name: i.name, value: i.value })),
				label: { color: '#1a4547' }
			}
		]
	};

	const byVenueOption: EChartsOption = {
		color: palette,
		title: { text: '各地点报名 vs 容量', textStyle: { color: '#0b2e2f', fontWeight: 600 } },
		tooltip: {},
		legend: { top: 28, textStyle: { color: '#1a4547' } },
		grid: { left: 40, right: 20, top: 72, bottom: 40 },
		xAxis: {
			type: 'category',
			data: mockStats.byVenue.map((i) => i.name),
			...axisStyle
		},
		yAxis: { type: 'value', ...axisStyle },
		series: [
			{
				name: '已报名',
				type: 'bar',
				data: mockStats.byVenue.map((i) => i.enrolled),
				itemStyle: { borderRadius: [8, 8, 0, 0] }
			},
			{
				name: '容量',
				type: 'bar',
				data: mockStats.byVenue.map((i) => i.capacity),
				itemStyle: { borderRadius: [8, 8, 0, 0] }
			}
		]
	};

	const byDayOption: EChartsOption = {
		color: palette,
		title: { text: '按日报名趋势', textStyle: { color: '#0b2e2f', fontWeight: 600 } },
		tooltip: {},
		grid: { left: 40, right: 20, top: 56, bottom: 40 },
		xAxis: {
			type: 'category',
			data: mockStats.byDay.map((i) => i.date),
			...axisStyle
		},
		yAxis: { type: 'value', ...axisStyle },
		series: [
			{
				type: 'line',
				smooth: true,
				symbolSize: 8,
				areaStyle: { color: 'rgba(15,118,110,0.12)' },
				data: mockStats.byDay.map((i) => i.count)
			}
		]
	};
</script>

<section class="mb-8">
	<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-(--accent-deep) uppercase">
		Insights
	</p>
	<h1 class="page-title">申请情况统计</h1>
	<p class="page-lead">用图表快速了解课程热度、学习方式分布与场地承载情况（当前为 mock 数据）。</p>
</section>

<div class="grid gap-5">
	<div class="surface p-4 md:p-5"><ChartHost option={byCourseOption} /></div>
	<div class="grid gap-5 md:grid-cols-2">
		<div class="surface p-4 md:p-5"><ChartHost option={byModeOption} /></div>
		<div class="surface p-4 md:p-5"><ChartHost option={byDayOption} /></div>
	</div>
	<div class="surface p-4 md:p-5"><ChartHost option={byVenueOption} /></div>
</div>
