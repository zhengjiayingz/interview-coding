<script lang="ts">
	import type { Course } from '$lib/types/enrollment';
	import { formatDateTime } from '$lib/utils/dates';

	interface Props {
		course: Course;
	}

	let { course }: Props = $props();

	const modeLabel: Record<Course['mode'], string> = {
		online: '线上学习',
		offline: '线下培训',
		hybrid: '混合模式'
	};
</script>

<article class="course-card surface flex h-full flex-col p-5 md:p-6">
	<div class="mb-4 flex items-start justify-between gap-3">
		<h2 class="font-[family-name:var(--font-display)] text-xl leading-snug text-(--ink) md:text-[1.35rem]">
			{course.title}
		</h2>
		<span class={course.mode === 'offline' ? 'chip chip-warm' : 'chip'}>
			{modeLabel[course.mode]}
		</span>
	</div>

	<p class="mb-5 flex-1 text-sm leading-relaxed text-[rgba(11,46,47,0.68)]">
		{course.description}
	</p>

	<div class="mb-5 flex items-center gap-2 text-xs text-[rgba(11,46,47,0.55)]">
		<span
			class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(15,118,110,0.1)]"
			aria-hidden="true"
		>
			<span class="h-2 w-2 rounded-full bg-(--accent)"></span>
		</span>
		<span>开课 {formatDateTime(course.startAt)}</span>
	</div>

	<a href="/apply/{course.id}" class="btn btn-primary self-start">立即报名</a>
</article>
