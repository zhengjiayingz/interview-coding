import { canEdit, getEditableUntil } from '$lib/domain/editWindow';
import type { Course } from '$lib/types/enrollment';
import { describe, expect, it } from 'vitest';

const course = {
	id: 'c1',
	title: 't',
	description: 'd',
	mode: 'online',
	startAt: '2026-09-15T09:00:00+08:00',
	endAt: '2026-09-15T12:00:00+08:00',
	venues: [],
	extraFieldSchema: []
} satisfies Course;

describe('editWindow', () => {
	it('editableUntil is one day before start', () => {
		const until = getEditableUntil(course);
		expect(until.toISOString().startsWith('2026-09-14')).toBe(true);
	});

	it('can edit before the window closes', () => {
		expect(canEdit(course, new Date('2026-09-13T12:00:00+08:00'))).toBe(true);
	});

	it('cannot edit after the window closes', () => {
		expect(canEdit(course, new Date('2026-09-14T12:00:00+08:00'))).toBe(false);
	});
});
