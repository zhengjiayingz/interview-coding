<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DynamicForm from '$lib/components/DynamicForm.svelte';
	import PreviewPanel from '$lib/components/PreviewPanel.svelte';
	import Stepper from '$lib/components/Stepper.svelte';
	import VenueSessionPicker from '$lib/components/VenueSessionPicker.svelte';
	import NoticeGate from '$lib/components/NoticeGate.svelte';
	import {
		personalFieldDisplayValue,
		personalInfoFields,
		type PersonalFieldId
	} from '$lib/config/personalFields';
	import { assertReadyToSubmit, toEnrollment } from '$lib/domain/enrollmentDraft';
	import { remainingSeats } from '$lib/domain/capacity';
	import { validateDetails, validatePersonal, validatePersonalField } from '$lib/domain/validate';
	import { getCourseById } from '$lib/mock/courses';
	import { applications } from '$lib/stores/applications';
	import type { CourseMode, PersonalInfo } from '$lib/types/enrollment';
	import { formatDateTime } from '$lib/utils/dates';
	import { get } from 'svelte/store';

	const steps = ['个人信息', '培训详情', '预览确认'];

	let current = $state(0);
	let personal = $state<PersonalInfo>({
		name: '',
		phone: '',
		email: '',
		address: ''
	});
	let learningMode = $state<CourseMode>('online');
	let venueId = $state('');
	let sessionId = $state('');
	let extra = $state<Record<string, unknown>>({});
	let agreedToNotice = $state(false);
	let stepErrors = $state<Record<string, string>>({});
	let submitError = $state('');
	let submitting = $state(false);

	let modeInitializedFor = $state<string | null>(null);
	// 从 URL 参数获取课程 ID，并获取课程信息
	const course = $derived(getCourseById(page.params.courseId ?? ''));

	/** 按课程 mode 初始化学习方式（与课程一致）；切换课程时重置地点场次 */
	// $effect 是 Svelte 的副作用函数，用于用来在响应式状态变化后自动跑一段副作用，这里按课程初始化 learningMode
	// 如果课程Id变了，则重新初始化学习方式，并且重置各种响应式数据
	$effect(() => {
		if (!course) return;
		// 已经按哪门课做过学习方式初始化
		if (modeInitializedFor === course.id) return;
		learningMode = course.mode;
		venueId = '';
		sessionId = '';
		extra = {};
		agreedToNotice = false;
		stepErrors = {};
		submitError = '';
		modeInitializedFor = course.id;
	});
	// 是否显示地点场次选择器
	const showVenuePicker = $derived(!!course && course.mode === 'offline');

	/** 当前所选场次剩余名额；非线下或不完整选择时为 null */
	const selectedSeatsLeft = $derived(
		!course || !showVenuePicker || !venueId || !sessionId
			? null
			: remainingSeats(course, venueId, sessionId, $applications)
	);

	const sessionHasNoSeats = $derived(selectedSeatsLeft !== null && selectedSeatsLeft <= 0);

	function draftPayload() {
		return {
			personal,
			learningMode,
			venueId: venueId || undefined,
			sessionId: sessionId || undefined,
			extra,
			agreedToNotice
		};
	}

	function goNextFromPersonal() {
		submitError = '';
		stepErrors = validatePersonal(personal);
		if (Object.keys(stepErrors).length) return;
		current = 1;
	}

	function goNextFromDetails() {
		if (!course) return;
		submitError = '';
		stepErrors = validateDetails(course, draftPayload());

		if (showVenuePicker && venueId && sessionId) {
			const left = remainingSeats(course, venueId, sessionId, get(applications));
			if (left <= 0) {
				stepErrors = {
					...stepErrors,
					sessionId: '该场次名额已满，请更换地点或场次'
				};
			}
		}

		if (Object.keys(stepErrors).length) return;
		current = 2;
	}

	function submit() {
		if (!course || submitting) return;
		submitError = '';
		stepErrors = {};

		const draft = draftPayload();
		const personalErrors = validatePersonal(draft.personal);
		const detailErrors = validateDetails(course, draft);
		if (Object.keys(personalErrors).length || Object.keys(detailErrors).length) {
			stepErrors = { ...personalErrors, ...detailErrors };
			current = Object.keys(personalErrors).length ? 0 : 1;
			submitError = '表单未填写完整，请返回修改';
			return;
		}

		try {
			submitting = true;
			assertReadyToSubmit(course, draft, get(applications));
			const enrollment = toEnrollment(course, draft, crypto.randomUUID());
			// 保存报名信息
			applications.upsert(enrollment);
			goto('/applications');
		} catch (e) {
			submitError = e instanceof Error ? e.message : '提交失败，请稍后重试';
		} finally {
			submitting = false;
		}
	}

	function modeLabel(mode: CourseMode) {
		return mode === 'online' ? '线上学习' : '线下培训';
	}

	function formatSession(startsAt: string, endsAt: string) {
		return `${formatDateTime(startsAt)} ~ ${formatDateTime(endsAt)}`;
	}
</script>
{#if !course}
	<section class="surface empty-state">
		<p class="mb-3">未找到该课程</p>
		<a class="btn btn-primary" href="/courses">返回课程列表</a>
	</section>
{:else}
	<section class="apply-hero mb-6">
		<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-(--accent-deep) uppercase">
			Enrollment
		</p>
		<div class="mb-3 flex flex-wrap items-center gap-2">
			<span class={course.mode === 'offline' ? 'chip chip-warm' : 'chip'}>
				{modeLabel(course.mode)}
			</span>
			<span class="chip">开课 {formatDateTime(course.startAt)}</span>
		</div>
		<h1 class="page-title">报名 · {course.title}</h1>
		<p class="page-lead">分步填写信息，预览确认后再提交。有误可随时回到对应步骤修改。</p>
	</section>
	 <!-- 步骤条 -->
	<Stepper {steps} {current} />

	{#if current === 0}
		<section class="surface step-panel page-enter max-w-xl p-5 md:p-6">
			<p class="mb-4 text-xs font-semibold tracking-[0.14em] text-(--accent-deep) uppercase">
				Step 1 · 基本资料
			</p>
			<DynamicForm
				schema={personalInfoFields}
				bind:values={personal}
				bind:errors={stepErrors}
				validateField={(id, values) =>
					validatePersonalField(id as PersonalFieldId, values as unknown as PersonalInfo)
				}
			/>
			<div class="mt-2 flex justify-end">
				<button type="button" class="btn btn-primary" onclick={goNextFromPersonal}>下一步</button>
			</div>
		</section>
	{:else if current === 1}
		<section class="surface step-panel page-enter max-w-xl p-5 md:p-6">
			<p class="mb-4 text-xs font-semibold tracking-[0.14em] text-(--accent-deep) uppercase">
				Step 2 · 培训安排
			</p>
			<p class="mb-4 text-sm text-(--ink-soft)">
				学习方式：<span class="font-semibold text-(--ink)">{modeLabel(learningMode)}</span>
				（由课程类型决定）
			</p>

			{#if showVenuePicker}
				<VenueSessionPicker
					{course}
					enrollments={$applications}
					errors={stepErrors}
					bind:venueId
					bind:sessionId
				/>
			{:else}
				<p class="mb-4 rounded-xl bg-[rgba(15,118,110,0.06)] px-3.5 py-3 text-sm text-(--ink-soft)">
					线上学习无需选择培训地点与场次。
				</p>
			{/if}

			{#if course.extraFieldSchema.length}
				<DynamicForm schema={course.extraFieldSchema} bind:values={extra} errors={stepErrors} />
			{:else}
				<p class="mb-4 text-sm text-[rgba(11,46,47,0.5)]">本课程暂无额外填写项。</p>
			{/if}

			{#if course.notice}
				<NoticeGate notice={course.notice} bind:agreed={agreedToNotice} error={stepErrors.agreedToNotice} />
			{/if}

			<div class="mt-2 flex flex-col gap-3">
				{#if sessionHasNoSeats}
					<p class="rounded-xl bg-[rgba(185,28,28,0.08)] px-3.5 py-3 text-sm text-(--danger)">
						该场次名额已满，请更换地点或场次后再继续。
					</p>
				{/if}
				<div class="flex justify-between gap-2">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={() => {
							stepErrors = {};
							current = 0;
						}}
					>
						上一步
					</button>
					<button
						type="button"
						class="btn btn-primary"
						disabled={sessionHasNoSeats}
						onclick={goNextFromDetails}
					>
						下一步
					</button>
				</div>
			</div>
		</section>
	{:else}
		<section class="page-enter">
			<p class="mb-4 text-xs font-semibold tracking-[0.14em] text-(--accent-deep) uppercase">
				Step 3 · 确认提交
			</p>
			<PreviewPanel
				sections={[
					{
						title: '个人信息',
						stepIndex: 0,
						rows: personalInfoFields.map((field) => ({
							label: field.label,
							value: personalFieldDisplayValue(field, personal)
						}))
					},
					{
						title: '培训详情 / 扩展信息',
						stepIndex: 1,
						rows: [
							{ label: '学习方式', value: modeLabel(learningMode) },
							...(showVenuePicker
								? [
										{
											label: '培训地点',
											value: course.venues.find((v) => v.id === venueId)?.name ?? venueId
										},
										{
											label: '培训场次',
											value: (() => {
												const s = course.venues
													.find((v) => v.id === venueId)
													?.sessions.find((x) => x.id === sessionId);
												return s ? formatSession(s.startsAt, s.endsAt) : sessionId;
											})()
										}
									]
								: []),
							...course.extraFieldSchema.map((f) => ({
								label: f.label,
								value: String(extra[f.id] ?? '')
							})),
							...(course.notice
								? [{ label: '报名须知', value: agreedToNotice ? '已阅读' : '未阅读' }]
								: [])
						]
					}
				]}
				onEditStep={(i: number) => {
					stepErrors = {};
					current = i;
				}}
			/>
			<div class="mt-5 flex flex-col gap-3">
				{#if submitError}
					<p class="rounded-xl bg-[rgba(185,28,28,0.08)] px-3.5 py-3 text-sm text-(--danger)">
						{submitError}
					</p>
				{/if}
				<div class="flex justify-between gap-2">
					<button type="button" class="btn btn-ghost" onclick={() => (current = 1)}>上一步</button>
					<button
						type="button"
						class="btn btn-primary"
						disabled={submitting}
						onclick={submit}
					>
						{submitting ? '提交中…' : '提交报名'}
					</button>
				</div>
			</div>
		</section>
	{/if}
{/if}
