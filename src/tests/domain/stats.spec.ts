import { buildEnrollmentStats } from '$lib/domain/stats';
import type { Course, Enrollment } from '$lib/types/enrollment';
import { describe, expect, it } from 'vitest';

const courses = [
	{
		id: 'c-on',
		title: '线上课',
		description: '',
		mode: 'online',
		startAt: '2026-09-15T09:00:00+08:00',
		endAt: '2026-09-15T12:00:00+08:00',
		venues: [],
		extraFieldSchema: []
	},
	{
		id: 'c-off',
		title: '线下课',
		description: '',
		mode: 'offline',
		startAt: '2026-09-20T14:00:00+08:00',
		endAt: '2026-09-20T17:00:00+08:00',
		venues: [
			{ id: 'v1', name: '广州', address: 'a', capacity: 10, sessions: [] },
			{ id: 'v2', name: '深圳', address: 'b', capacity: 5, sessions: [] }
		],
		extraFieldSchema: []
	}
] satisfies Course[];

function en(
	partial: Partial<Enrollment> & Pick<Enrollment, 'id' | 'courseId' | 'learningMode'>
): Enrollment {
	return {
		status: 'submitted',
		personal: { name: 'a', phone: '1', email: '', address: '' },
		extra: {},
		agreedToNotice: true,
		createdAt: '2026-08-05T10:00:00+08:00',
		updatedAt: '2026-08-05T10:00:00+08:00',
		...partial
	};
}

describe('buildEnrollmentStats', () => {
	it('aggregates course mode venue and day from real enrollments', () => {
		const stats = buildEnrollmentStats(
			[
				en({ id: '1', courseId: 'c-on', learningMode: 'online' }),
				en({
					id: '2',
					courseId: 'c-off',
					learningMode: 'offline',
					venueId: 'v1',
					createdAt: '2026-08-06T12:00:00+08:00'
				}),
				en({
					id: '3',
					courseId: 'c-off',
					learningMode: 'offline',
					venueId: 'v1',
					status: 'cancelled'
				})
			],
			courses
		);

		expect(stats.byCourse).toEqual([
			{ name: '线上课', count: 1 },
			{ name: '线下课', count: 1 }
		]);
		expect(stats.byMode).toEqual([
			{ name: '线上', value: 1 },
			{ name: '线下', value: 1 }
		]);
		expect(stats.byVenue).toEqual([
			{ name: '广州', enrolled: 1, capacity: 10 },
			{ name: '深圳', enrolled: 0, capacity: 5 }
		]);
		expect(stats.byDay).toEqual([
			{ date: '2026-08-05', count: 1 },
			{ date: '2026-08-06', count: 1 }
		]);
	});

	it('returns zero counts when no enrollments', () => {
		const stats = buildEnrollmentStats([], courses);
		expect(stats.byCourse.every((c) => c.count === 0)).toBe(true);
		expect(stats.byMode.every((m) => m.value === 0)).toBe(true);
		expect(stats.byDay).toEqual([]);
	});
});
