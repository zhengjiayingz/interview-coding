<script lang="ts">
	import { page } from '$app/state';
	import DynamicForm from '$lib/components/DynamicForm.svelte';
	import VenueSessionPicker from '$lib/components/VenueSessionPicker.svelte';
	import { personalInfoFields, type PersonalFieldId } from '$lib/config/personalFields';
	import { remainingSeats } from '$lib/domain/capacity';
	import { assertReadyToSubmit } from '$lib/domain/enrollmentDraft';
	import { canEdit, getEditableUntil } from '$lib/domain/editWindow';
	import { validateDetails, validatePersonal, validatePersonalField } from '$lib/domain/validate';
	import { getCourseById } from '$lib/mock/courses';
	import { applications } from '$lib/stores/applications';
	import type { CourseMode, PersonalInfo } from '$lib/types/enrollment';
	import { formatDateTime } from '$lib/utils/dates';
	import { get } from 'svelte/store';
	import { onDestroy } from 'svelte';

	const enrollment = $derived($applications.find((e) => e.id === page.params.id));
	const course = $derived(enrollment ? getCourseById(enrollment.courseId) : undefined);
	const editable = $derived(course ? canEdit(course) : false);
	const editableUntil = $derived(course ? getEditableUntil(course) : null);

	const venue = $derived(course?.venues.find((v) => v.id === enrollment?.venueId));
	const session = $derived(venue?.sessions.find((s) => s.id === enrollment?.sessionId));

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
	let formErrors = $state<Record<string, string>>({});
	let saveError = $state('');
	let saveOk = $state('');
	/** 开始淡出时为 true，动画结束后清空文案 */
	let saveOkLeaving = $state(false);
	let saving = $state(false);
	let hydratedFor = $state<string | null>(null);
	let saveOkHideTimer: ReturnType<typeof setTimeout> | undefined;
	let saveOkClearTimer: ReturnType<typeof setTimeout> | undefined;

	function clearSaveOkTimers() {
		if (saveOkHideTimer !== undefined) clearTimeout(saveOkHideTimer);
		if (saveOkClearTimer !== undefined) clearTimeout(saveOkClearTimer);
		saveOkHideTimer = undefined;
		saveOkClearTimer = undefined;
	}

	function dismissSaveOk() {
		clearSaveOkTimers();
		saveOk = '';
		saveOkLeaving = false;
	}

	/** 淡入展示约 2.4s，再淡出约 0.35s 后移除 */
	function flashSaveOk(message: string) {
		clearSaveOkTimers();
		saveOkLeaving = false;
		saveOk = message;
		saveOkHideTimer = setTimeout(() => {
			saveOkLeaving = true;
			saveOkClearTimer = setTimeout(() => {
				saveOk = '';
				saveOkLeaving = false;
				saveOkHideTimer = undefined;
				saveOkClearTimer = undefined;
			}, 350);
		}, 2400);
	}

	onDestroy(clearSaveOkTimers);

	/** 进入详情或切换记录时，用已有报名预填表单 */
	$effect(() => {
		if (!enrollment) return;
		if (hydratedFor === enrollment.id) return;
		personal = { ...enrollment.personal };
		learningMode = enrollment.learningMode;
		venueId = enrollment.venueId ?? '';
		sessionId = enrollment.sessionId ?? '';
		extra = { ...enrollment.extra };
		agreedToNotice = enrollment.agreedToNotice;
		formErrors = {};
		saveError = '';
		dismissSaveOk();
		hydratedFor = enrollment.id;
	});

	const showVenuePicker = $derived(!!course && course.mode === 'offline');

	const selectedSeatsLeft = $derived(
		!course || !showVenuePicker || !venueId || !sessionId || !enrollment
			? null
			: remainingSeats(course, venueId, sessionId, $applications, enrollment.id)
	);

	const sessionHasNoSeats = $derived(selectedSeatsLeft !== null && selectedSeatsLeft <= 0);

	function modeLabel(mode: CourseMode | string) {
		if (mode === 'online') return '线上学习';
		if (mode === 'offline') return '线下培训';
		return String(mode);
	}

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

	function save() {
		if (!course || !enrollment || !editable || saving) return;
		saveError = '';
		dismissSaveOk();

		const draft = draftPayload();
		const personalErrors = validatePersonal(draft.personal);
		const detailErrors = validateDetails(course, draft);

		if (showVenuePicker && venueId && sessionId) {
			const left = remainingSeats(course, venueId, sessionId, get(applications), enrollment.id);
			if (left <= 0) {
				detailErrors.sessionId = '该场次名额已满，请更换地点或场次';
			}
		}

		formErrors = { ...personalErrors, ...detailErrors };
		if (Object.keys(formErrors).length) {
			saveError = '表单未填写完整或名额不足，请检查后再保存';
			return;
		}

		try {
			saving = true;
			assertReadyToSubmit(course, draft, get(applications), enrollment.id);
			applications.upsert({
				...enrollment,
				personal: { ...draft.personal },
				learningMode: course.mode,
				venueId: draft.venueId,
				sessionId: draft.sessionId,
				extra: { ...draft.extra },
				agreedToNotice: draft.agreedToNotice,
				updatedAt: new Date().toISOString()
			});
			flashSaveOk('已保存修改');
		} catch (e) {
			saveError = e instanceof Error ? e.message : '保存失败';
		} finally {
			saving = false;
		}
	}
</script>

{#if !enrollment}
	<section class="surface empty-state">
		<p class="mb-3">未找到该报名记录</p>
		<a class="btn btn-primary" href="/applications">返回列表</a>
	</section>
{:else if !course}
	<section class="surface empty-state">
		<p class="mb-3">关联课程不存在</p>
		<a class="btn btn-primary" href="/applications">返回列表</a>
	</section>
{:else}
	<section class="mb-6">
		<p class="mb-2 text-xs font-semibold tracking-[0.18em] text-(--accent-deep) uppercase">
			Application Detail
		</p>
		<h1 class="page-title">报名详情</h1>
		<p class="page-lead">
			{editable
				? `可修改联系方式、地点场次与扩展信息。截止：${editableUntil ? formatDateTime(editableUntil.toISOString()) : '—'}`
				: '已超过可编辑时间，当前为只读查看。'}
		</p>
	</section>

	<div class="mb-4 flex flex-wrap items-center gap-2">
		<span class={editable ? 'chip' : 'chip chip-warm'}>
			{editable ? '可修改' : '已锁定'}
		</span>
		<span class="text-xs text-[rgba(11,46,47,0.5)]">课程：{course.title}</span>
	</div>

	{#if editable}
		<section class="surface mb-5 max-w-xl p-5 md:p-6">
			<h2 class="mb-4 font-(family-name:--font-display) text-xl text-(--ink)">修改报名信息</h2>

			<DynamicForm
				schema={personalInfoFields}
				idPrefix="edit-"
				bind:values={personal}
				bind:errors={formErrors}
				validateField={(id, values) =>
					validatePersonalField(id as PersonalFieldId, values as unknown as PersonalInfo)
				}
			/>

			<p class="mb-4 text-sm text-(--ink-soft)">
				学习方式：<span class="font-semibold text-(--ink)">{modeLabel(learningMode)}</span>
				（报名后不可更换课程与学习方式类型）
			</p>

			{#if showVenuePicker}
				<VenueSessionPicker
					{course}
					enrollments={$applications}
					excludeEnrollmentId={enrollment.id}
					errors={formErrors}
					bind:venueId
					bind:sessionId
				/>
			{/if}

			{#if course.extraFieldSchema.length}
				<DynamicForm schema={course.extraFieldSchema} bind:values={extra} errors={formErrors} />
			{/if}

			{#if sessionHasNoSeats}
				<p class="mb-3 rounded-xl bg-[rgba(185,28,28,0.08)] px-3.5 py-3 text-sm text-(--danger)">
					该场次名额已满，请更换地点或场次后再保存。
				</p>
			{/if}
			{#if saveError}
				<p class="mb-3 rounded-xl bg-[rgba(185,28,28,0.08)] px-3.5 py-3 text-sm text-(--danger)">
					{saveError}
				</p>
			{/if}
			{#if saveOk}
				<p
					class="toast-banner toast-banner-ok mb-3 {saveOkLeaving
						? 'toast-banner-out'
						: 'toast-banner-in'}"
					role="status"
				>
					{saveOk}
				</p>
			{/if}

			<div class="flex flex-wrap gap-2">
				<button
					type="button"
					class="btn btn-primary"
					disabled={saving || sessionHasNoSeats}
					onclick={save}
				>
					{saving ? '保存中…' : '保存修改'}
				</button>
				<a class="btn btn-ghost" href="/applications">返回列表</a>
			</div>
		</section>
	{:else}
		<section class="surface mb-5 space-y-3 p-5 text-sm">
			<p><span class="text-[rgba(11,46,47,0.5)]">学员：</span>{enrollment.personal.name} · {enrollment.personal.phone}</p>
			<p><span class="text-[rgba(11,46,47,0.5)]">邮箱：</span>{enrollment.personal.email || '—'}</p>
			<p><span class="text-[rgba(11,46,47,0.5)]">地址：</span>{enrollment.personal.address}</p>
			<p><span class="text-[rgba(11,46,47,0.5)]">学习方式：</span>{modeLabel(enrollment.learningMode)}</p>
			{#if venue}
				<p><span class="text-[rgba(11,46,47,0.5)]">地点：</span>{venue.name}</p>
			{/if}
			{#if session}
				<p>
					<span class="text-[rgba(11,46,47,0.5)]">场次：</span>{formatDateTime(session.startsAt)} ~ {formatDateTime(
						session.endsAt
					)}
				</p>
			{/if}
			{#each course.extraFieldSchema as field (field.id)}
				<p>
					<span class="text-[rgba(11,46,47,0.5)]">{field.label}：</span>{String(
						enrollment.extra[field.id] ?? '—'
					)}
				</p>
			{/each}
			<p><span class="text-[rgba(11,46,47,0.5)]">提交时间：</span>{formatDateTime(enrollment.createdAt)}</p>
			<p><span class="text-[rgba(11,46,47,0.5)]">更新时间：</span>{formatDateTime(enrollment.updatedAt)}</p>
		</section>
		<a class="btn btn-ghost" href="/applications">返回列表</a>
	{/if}
{/if}
