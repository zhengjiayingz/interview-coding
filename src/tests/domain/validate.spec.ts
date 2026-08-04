import { validateDetails, validatePersonal } from '$lib/domain/validate';
import type { Course } from '$lib/types/enrollment';
import { describe, expect, it } from 'vitest';

describe('validatePersonal', () => {
	it('requires name phone address', () => {
		const errors = validatePersonal({ name: '', phone: '', email: '', address: '' });
		expect(errors.name).toBeTruthy();
		expect(errors.phone).toBeTruthy();
		expect(errors.address).toBeTruthy();
	});

	it('passes when required fields present', () => {
		const errors = validatePersonal({
			name: '张三',
			phone: '13800000000',
			email: 'a@b.com',
			address: '广州'
		});
		expect(Object.keys(errors)).toHaveLength(0);
	});
});

const offlineCourse = {
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
				{
					id: 's1',
					startsAt: '2026-09-20T14:00:00+08:00',
					endsAt: '2026-09-20T17:00:00+08:00'
				}
			]
		}
	],
	extraFieldSchema: [
		{
			id: 'tshirt',
			label: 'T恤',
			type: 'select',
			required: true,
			options: [{ label: 'M', value: 'M' }]
		}
	],
	notice: '须知'
} satisfies Course;

describe('validateDetails', () => {
	it('offline requires venue and session', () => {
		const errors = validateDetails(offlineCourse, {
			learningMode: 'offline',
			venueId: undefined,
			sessionId: undefined,
			extra: { tshirt: 'M' },
			agreedToNotice: true
		});
		expect(errors.venueId).toBeTruthy();
		expect(errors.sessionId).toBeTruthy();
	});

	it('requires schema required extras', () => {
		const errors = validateDetails(offlineCourse, {
			learningMode: 'offline',
			venueId: 'v1',
			sessionId: 's1',
			extra: {},
			agreedToNotice: true
		});
		expect(errors.tshirt).toBeTruthy();
	});

	it('passes when offline details complete', () => {
		const errors = validateDetails(offlineCourse, {
			learningMode: 'offline',
			venueId: 'v1',
			sessionId: 's1',
			extra: { tshirt: 'M' },
			agreedToNotice: true
		});
		expect(Object.keys(errors)).toHaveLength(0);
	});
});
