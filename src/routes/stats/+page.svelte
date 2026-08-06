<script lang="ts">
	import ChartHost from '$lib/components/charts/ChartHost.svelte';
	import { buildEnrollmentStats } from '$lib/domain/stats';
	import { mockCourses } from '$lib/mock/courses';
	import { applications } from '$lib/stores/applications';
	import type { EChartsOption } from 'echarts';

	const palette = ['#0f766e', '#1a4547', '#b45309', '#59a9a1', '#0b2e2f'];

	const axisStyle = {
		axisLabel: { color: '#1a4547' },
		axisLine: { lineStyle: { color: 'rgba(11,46,47,0.15)' } },
		splitLine: { lineStyle: { color: 'rgba(11,46,47,0.06)' } }
	};

	const stats = $derived(buildEnrollmentStats($applications, mockCourses));

	const byCourseOption = $derived<EChartsOption>({
		color: palette,
		title: {
			text: '各课程报名量',
			left: 0,
			top: 0,
			textStyle: { color: '#0b2e2f', fontWeight: 600, fontSize: 15 }
		},
		tooltip: {},
		grid: { left: 48, right: 24, top: 56, bottom: 72 },
		xAxis: {
			type: 'category',
			data: stats.byCourse.map((i) => i.name),
			axisLabel: {
				color: '#1a4547',
				interval: 0,
				rotate: 20,
				hideOverlap: true
			},
			axisLine: axisStyle.axisLine,
			splitLine: axisStyle.splitLine
		},
		yAxis: { type: 'value', minInterval: 1, ...axisStyle },
		series: [
			{
				type: 'bar',
				data: stats.byCourse.map((i) => i.count),
				itemStyle: { borderRadius: [8, 8, 0, 0] },
				barWidth: 36
			}
		]
	});

	const byModeOption = $derived<EChartsOption>({
		color: palette,
		title: {
			text: '线上 / 线下占比',
			left: 0,
			top: 0,
			textStyle: { color: '#0b2e2f', fontWeight: 600, fontSize: 15 }
		},
		tooltip: { trigger: 'item' },
		legend: { bottom: 0, textStyle: { color: '#1a4547' } },
		series: [
			{
				type: 'pie',
				radius: ['38%', '62%'],
				center: ['50%', '52%'],
				data: stats.byMode.map((i) => ({ name: i.name, value: i.value })),
				label: { color: '#1a4547' }
			}
		]
	});

	const byVenueOption = $derived<EChartsOption>({
		color: palette,
		title: {
			text: '各地点报名 vs 容量',
			left: 0,
			top: 0,
			textStyle: { color: '#0b2e2f', fontWeight: 600, fontSize: 15 }
		},
		tooltip: {},
		legend: {
			top: 0,
			right: 0,
			textStyle: { color: '#1a4547' }
		},
		grid: { left: 48, right: 24, top: 56, bottom: 48 },
		xAxis: {
			type: 'category',
			data: stats.byVenue.map((i) => i.name),
			...axisStyle
		},
		yAxis: { type: 'value', minInterval: 1, ...axisStyle },
		series: [
			{
				name: '已报名',
				type: 'bar',
				data: stats.byVenue.map((i) => i.enrolled),
				itemStyle: { borderRadius: [8, 8, 0, 0] },
				barMaxWidth: 40
			},
			{
				name: '容量',
				type: 'bar',
				data: stats.byVenue.map((i) => i.capacity),
				itemStyle: { borderRadius: [8, 8, 0, 0] },
				barMaxWidth: 40
			}
		]
	});

	const byDayOption = $derived<EChartsOption>({
		color: palette,
		title: {
			text: '按日报名趋势',
			left: 0,
			top: 0,
			textStyle: { color: '#0b2e2f', fontWeight: 600, fontSize: 15 }
		},
		tooltip: {},
		grid: { left: 48, right: 24, top: 56, bottom: 40 },
		xAxis: {
			type: 'category',
			data: stats.byDay.length ? stats.byDay.map((i) => i.date) : ['—'],
			...axisStyle
		},
		yAxis: { type: 'value', minInterval: 1, ...axisStyle },
		series: [
			{
				type: 'line',
				smooth: true,
				symbolSize: 8,
				areaStyle: { color: 'rgba(15,118,110,0.12)' },
				data: stats.byDay.length ? stats.byDay.map((i) => i.count) : [0]
			}
		]
	});
</script>

<section class="mb-8">
	<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-(--accent-deep) uppercase">
		Insights
	</p>
	<h1 class="page-title">申请情况统计</h1>
	<p class="page-lead">
		基于本地报名数据实时汇总：课程热度、学习方式分布、场地承载与按日趋势。
	</p>
	{#if $applications.length === 0}
		<p class="mt-3 rounded-xl bg-[rgba(15,118,110,0.06)] px-3.5 py-3 text-sm text-(--ink-soft)">
			暂无报名记录，图表为 0。去课程列表提交报名后会自动更新。
		</p>
	{/if}
</section>

<div class="grid gap-5">
	<div class="surface p-4 md:p-5"><ChartHost option={byCourseOption} height="360px" /></div>
	<div class="grid gap-5 md:grid-cols-2">
		<div class="surface p-4 md:p-5"><ChartHost option={byModeOption} /></div>
		<div class="surface p-4 md:p-5"><ChartHost option={byDayOption} /></div>
	</div>
	<div class="surface p-4 md:p-5"><ChartHost option={byVenueOption} height="360px" /></div>
</div>
