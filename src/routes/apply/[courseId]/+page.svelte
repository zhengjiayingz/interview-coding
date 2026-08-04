<script lang="ts">
	import { page } from '$app/state';
	import DynamicForm from '$lib/components/DynamicForm.svelte';
	import PreviewPanel from '$lib/components/PreviewPanel.svelte';
	import Stepper from '$lib/components/Stepper.svelte';
	import TextField from '$lib/components/fields/TextField.svelte';
	import { getCourseById } from '$lib/mock/courses';

	const steps = ['个人信息', '培训详情', '预览确认'];

	let current = $state(0);
	let personal = $state({
		name: '',
		phone: '',
		email: '',
		address: ''
	});
	let extra = $state<Record<string, unknown>>({});

	const course = $derived(getCourseById(page.params.courseId ?? ''));
</script>

{#if !course}
	<section class="surface empty-state">
		<p class="mb-3">未找到该课程</p>
		<a class="btn btn-primary" href="/courses">返回课程列表</a>
	</section>
{:else}
	<section class="mb-6">
		<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-[var(--accent-deep)] uppercase">
			Enrollment
		</p>
		<h1 class="page-title">报名 · {course.title}</h1>
		<p class="page-lead">分步填写信息，预览确认后再提交。有误可随时回到对应步骤修改。</p>
	</section>

	<Stepper {steps} {current} />

	{#if current === 0}
		<section class="surface page-enter max-w-xl p-5 md:p-6">
			<TextField id="name" label="姓名" required bind:value={personal.name} />
			<TextField id="phone" label="联系电话" required bind:value={personal.phone} />
			<TextField id="email" label="邮箱" bind:value={personal.email} />
			<TextField id="address" label="地址" required bind:value={personal.address} />
			<div class="mt-2 flex justify-end">
				<button type="button" class="btn btn-primary" onclick={() => (current = 1)}>下一步</button>
			</div>
		</section>
	{:else if current === 1}
		<section class="surface page-enter max-w-xl p-5 md:p-6">
			<p class="mb-4 rounded-xl bg-[rgba(15,118,110,0.06)] px-3.5 py-3 text-sm leading-relaxed text-[var(--ink-soft)]">
				学习方式与线下地点/场次将在此步完善。下方为可扩展的活动字段（schema 驱动）。
			</p>
			{#if course.extraFieldSchema.length}
				<DynamicForm schema={course.extraFieldSchema} bind:values={extra} />
			{:else}
				<p class="mb-4 text-sm text-[rgba(11,46,47,0.5)]">本课程暂无额外填写项。</p>
			{/if}
			<div class="mt-2 flex justify-between gap-2">
				<button type="button" class="btn btn-ghost" onclick={() => (current = 0)}>上一步</button>
				<button type="button" class="btn btn-primary" onclick={() => (current = 2)}>下一步</button>
			</div>
		</section>
	{:else}
		<section class="page-enter">
			<PreviewPanel
				sections={[
					{
						title: '个人信息',
						stepIndex: 0,
						rows: [
							{ label: '姓名', value: personal.name },
							{ label: '电话', value: personal.phone },
							{ label: '邮箱', value: personal.email },
							{ label: '地址', value: personal.address }
						]
					},
					{
						title: '培训详情 / 扩展信息',
						stepIndex: 1,
						rows: Object.entries(extra).map(([k, v]) => ({
							label: k,
							value: String(v ?? '')
						}))
					}
				]}
				onEditStep={(i) => (current = i)}
			/>
			<div class="mt-5 flex justify-between gap-2">
				<button type="button" class="btn btn-ghost" onclick={() => (current = 1)}>上一步</button>
				<button
					type="button"
					class="btn btn-primary"
					onclick={() => alert('提交逻辑待实现')}
				>
					提交报名
				</button>
			</div>
		</section>
	{/if}
{/if}
