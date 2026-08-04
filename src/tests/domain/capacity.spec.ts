import { remainingSeats } from '$lib/domain/capacity';
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
			sessions: [{ id: 's1', startsAt: '2026-09-20T14:00:00+08:00', endsAt: '2026-09-20T17:00:00+08:00' }]
		}
	],
	extraFieldSchema: []
} satisfies Course;

describe('capacity', () => {
	it('counts remaining seats against submitted enrollments', () => {
		const enrollments = [
			{
				id: 'e1',
				courseId: 'c-off',
				status: 'submitted',
				personal: { name: 'a', phone: '1', email: '', address: '' },
				learningMode: 'offline',
				venueId: 'v1',
				sessionId: 's1',
				extra: {},
				agreedToNotice: true,
				createdAt: '',
				updatedAt: ''
			}
		] satisfies Enrollment[];

		expect(remainingSeats(course, 'v1', 's1', enrollments)).toBe(1);
	});
});
