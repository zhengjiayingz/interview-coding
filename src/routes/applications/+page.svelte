<script lang="ts">
	import { applications } from '$lib/stores/applications';
	import { getCourseById } from '$lib/mock/courses';
	import { formatDateTime } from '$lib/utils/dates';

	function statusLabel(status: string) {
		if (status === 'submitted') return '已提交';
		if (status === 'draft') return '草稿';
		if (status === 'cancelled') return '已取消';
		return status;
	}

	function modeLabel(mode: string) {
		if (mode === 'online') return '线上';
		if (mode === 'offline') return '线下';
		return mode;
	}
</script>

<section class="mb-8">
	<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-(--accent-deep) uppercase">
		My Applications
	</p>
	<h1 class="page-title">我的报名</h1>
	<p class="page-lead">查看申请进度；开课前一天之前可修改部分报名信息。</p>
</section>
 <!-- 从localStorage读取报名信息,进行展示 -->
{#if $applications.length === 0}
	<section class="surface empty-state">
		<p class="mb-1 font-(family-name:--font-display) text-2xl text-(--ink)">还没有报名记录</p>
		<p class="mb-5 text-sm">从课程目录挑选一门，完成向导即可出现在这里。</p>
		<a class="btn btn-primary" href="/courses">去选课</a>
	</section>
{:else}
	<ul class="space-y-3">
		{#each $applications as item (item.id)}
			{@const course = getCourseById(item.courseId)}
			{@const venue = course?.venues.find((v) => v.id === item.venueId)}
			<li class="surface flex items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5">
				<div>
					<p class="font-semibold text-(--ink)">{course?.title ?? item.courseId}</p>
					<p class="mt-1 text-xs text-[rgba(11,46,47,0.5)]">
						{modeLabel(item.learningMode)}
						{#if venue}
							· {venue.name}
						{/if}
						· {statusLabel(item.status)} · 提交于 {formatDateTime(item.createdAt)}
					</p>
					<p class="mt-1 text-sm text-(--ink-soft)">{item.personal.name} · {item.personal.phone}</p>
				</div>
				<a class="btn btn-ghost px-3! py-1.5! text-xs" href="/applications/{item.id}">查看详情</a>
			</li>
		{/each}
	</ul>
{/if}
