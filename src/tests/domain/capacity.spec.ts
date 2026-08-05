import { assertCanBook, remainingSeats } from '$lib/domain/capacity';
import type { Course, Enrollment } from '$lib/types/enrollment';
import { describe, expect, it } from 'vitest';

const course = {
	id: 'c-off',
	title: 't',
	description: 'd',
	mode: 'offline',
	startAt: '2026-09-20T14:00:00+08:00',
	endAt: '2026-09-20T17:00:00+08:00',
	venues: [
		{
			id: 'v1',
			name: 'A',
			address: 'addr',
			capacity: 2,
			sessions: [
				{ id: 's1', startsAt: '2026-09-20T14:00:00+08:00', endsAt: '2026-09-20T17:00:00+08:00' }
			]
		}
	],
	extraFieldSchema: []
} satisfies Course;

function enrollment(id: string, overrides: Partial<Enrollment> = {}): Enrollment {
	return {
		id,
		courseId: 'c-off',
		status: 'submitted',
		personal: { name: 'a', phone: '1', email: '', address: '' },
		learningMode: 'offline',
		venueId: 'v1',
		sessionId: 's1',
		extra: {},
		agreedToNotice: true,
		createdAt: '',
		updatedAt: '',
		...overrides
	};
}

describe('capacity', () => {
	it('counts remaining seats against submitted enrollments', () => {
		expect(remainingSeats(course, 'v1', 's1', [enrollment('e1')])).toBe(1);
	});

	it('ignores draft enrollments when counting taken seats', () => {
		expect(
			remainingSeats(course, 'v1', 's1', [enrollment('e1', { status: 'draft' })])
		).toBe(2);
	});

	it('excludeEnrollmentId does not count self', () => {
		expect(remainingSeats(course, 'v1', 's1', [enrollment('e1')], 'e1')).toBe(2);
	});

	it('returns 0 for unknown venue or session', () => {
		expect(remainingSeats(course, 'missing', 's1', [])).toBe(0);
		expect(remainingSeats(course, 'v1', 'missing', [])).toBe(0);
	});

	it('assertCanBook throws when full', () => {
		const full = [enrollment('e1'), enrollment('e2')];
		expect(remainingSeats(course, 'v1', 's1', full)).toBe(0);
		expect(() => assertCanBook(course, 'v1', 's1', full)).toThrow('该场次名额已满');
	});

	it('assertCanBook allows when excluding self on a full session', () => {
		const full = [enrollment('e1'), enrollment('e2')];
		expect(() => assertCanBook(course, 'v1', 's1', full, 'e2')).not.toThrow();
	});
});
