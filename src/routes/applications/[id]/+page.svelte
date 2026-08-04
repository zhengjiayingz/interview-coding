<script lang="ts">
	import { page } from '$app/state';
	import { canEdit } from '$lib/domain/editWindow';
	import { getCourseById } from '$lib/mock/courses';
	import { applications } from '$lib/stores/applications';

	const enrollment = $derived($applications.find((e) => e.id === page.params.id));
	const course = $derived(enrollment ? getCourseById(enrollment.courseId) : undefined);
	const editable = $derived(course ? canEdit(course) : false);
</script>

{#if !enrollment}
	<section class="surface empty-state">
		<p class="mb-3">未找到该报名记录</p>
		<a class="btn btn-primary" href="/applications">返回列表</a>
	</section>
{:else}
	<section class="mb-6">
		<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-[var(--accent-deep)] uppercase">
			Application Detail
		</p>
		<h1 class="page-title">报名详情</h1>
		<p class="page-lead">
			{editable
				? '当前仍在可编辑窗口内，后续将开放修改表单。'
				: '已超过可编辑时间，当前为只读查看。'}
		</p>
	</section>

	<div class="mb-4">
		<span class={editable ? 'chip' : 'chip chip-warm'}>
			{editable ? '可修改' : '已锁定'}
		</span>
	</div>

	<pre class="surface overflow-auto p-5 text-xs leading-relaxed text-[var(--ink-soft)]">{JSON.stringify(
			enrollment,
			null,
			2
		)}</pre>

	<a class="btn btn-ghost mt-5" href="/applications">返回列表</a>
{/if}
