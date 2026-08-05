<script lang="ts">
	import SelectField from '$lib/components/fields/SelectField.svelte';
	import { remainingSeats } from '$lib/domain/capacity';
	import type { Course, Enrollment } from '$lib/types/enrollment';
	import { formatDateTime } from '$lib/utils/dates';

	interface Props {
		course: Course;
		venueId?: string;
		sessionId?: string;
		enrollments?: Enrollment[];
		errors?: Record<string, string>;
		/** 修改已有报名时排除自己，避免名额计算把自己算进去 */
		excludeEnrollmentId?: string;
	}

	let {
		course,
		venueId = $bindable(''),
		sessionId = $bindable(''),
		enrollments = [],
		errors = {},
		excludeEnrollmentId
	}: Props = $props();

	const venueOptions = $derived(
		course.venues.map((v) => ({
			label: `${v.name}（容量 ${v.capacity}）`,
			value: v.id
		}))
	);

	const selectedVenue = $derived(course.venues.find((v) => v.id === venueId));

	const sessionOptions = $derived(
		(selectedVenue?.sessions ?? []).map((s) => {
			const left = remainingSeats(course, venueId, s.id, enrollments, excludeEnrollmentId);
			return {
				label: `${formatDateTime(s.startsAt)} ~ ${formatDateTime(s.endsAt)}（剩 ${left}）`,
				value: s.id
			};
		})
	);

	const seats = $derived(
		venueId && sessionId
			? remainingSeats(course, venueId, sessionId, enrollments, excludeEnrollmentId)
			: null
	);

	function onVenueChange(next: string) {
		venueId = next;
		sessionId = '';
	}
</script>

<SelectField
	id="venueId"
	label="培训地点"
	required
	options={venueOptions}
	error={errors.venueId}
	bind:value={venueId}
	onchange={onVenueChange}
/>

{#if venueId}
	<SelectField
		id="sessionId"
		label="培训场次"
		required
		options={sessionOptions}
		error={errors.sessionId}
		bind:value={sessionId}
	/>
{/if}

{#if seats != null}
	<p
		class="mb-4 text-sm"
		class:text-(--danger)={seats <= 0}
		class:text-(--ink-soft)={seats > 0}
	>
		当前场次剩余名额：
		<span class="font-semibold" class:text-(--accent-deep)={seats > 0}>{seats}</span>
		{#if seats <= 0}
			<span class="ml-1">（已满，无法继续）</span>
		{/if}
	</p>
{/if}
