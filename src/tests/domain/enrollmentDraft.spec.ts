import {
	assertReadyToSubmit,
	toEnrollment
} from '../../lib/domain/enrollmentDraft';
import { mockCourses } from '../../lib/mock/courses';
import type { Enrollment } from '../../lib/types/enrollment';
import { describe, expect, it } from 'vitest';

const offlineCourse = mockCourses[1];

const validOfflineDraft = {
	personal: {
		name: '张三',
		phone: '13800000000',
		email: 'a@b.com',
		address: '广州'
	},
	learningMode: 'offline' as const,
	venueId: 'v-gz',
	sessionId: 's-gz-1',
	extra: { tshirt: 'M', dietary: '' },
	agreedToNotice: true
};

describe('assertReadyToSubmit', () => {
	it('throws when personal invalid', () => {
		expect(() =>
			assertReadyToSubmit(
				offlineCourse,
				{
					...validOfflineDraft,
					personal: { name: '', phone: '', email: '', address: '' }
				},
				[]
			)
		).toThrow('表单未填写完整');
	});

	it('throws when required extra missing', () => {
		expect(() =>
			assertReadyToSubmit(
				offlineCourse,
				{
					...validOfflineDraft,
					extra: {}
				},
				[]
			)
		).toThrow('表单未填写完整');
	});

	it('throws when venue is full', () => {
		const full: Enrollment[] = [
			{
				id: 'e1',
				courseId: offlineCourse.id,
				status: 'submitted',
				personal: validOfflineDraft.personal,
				learningMode: 'offline',
				venueId: 'v-gz',
				sessionId: 's-gz-1',
				extra: { tshirt: 'M' },
				agreedToNotice: true,
				createdAt: '',
				updatedAt: ''
			}
		];

		// 把场次容量压成 1，已有 1 条报名 → 再提交应失败
		const tightCourse = {
			...offlineCourse,
			venues: offlineCourse.venues.map((v) =>
				v.id === 'v-gz'
					? {
							...v,
							capacity: 1,
							sessions: v.sessions.map((s) =>
								s.id === 's-gz-1' ? { ...s, seatsLeft: 1 } : s
							)
						}
					: v
			)
		};

		expect(() => assertReadyToSubmit(tightCourse, validOfflineDraft, full)).toThrow(
			'该场次名额已满'
		);
	});

	it('passes for a complete offline draft', () => {
		expect(() => assertReadyToSubmit(offlineCourse, validOfflineDraft, [])).not.toThrow();
	});
});

describe('toEnrollment', () => {
	it('maps draft into a submitted enrollment', () => {
		const now = new Date('2026-08-04T06:00:00.000Z');
		const enrollment = toEnrollment(offlineCourse, validOfflineDraft, 'enr-1', now);

		expect(enrollment).toMatchObject({
			id: 'enr-1',
			courseId: offlineCourse.id,
			status: 'submitted',
			learningMode: 'offline',
			venueId: 'v-gz',
			sessionId: 's-gz-1',
			agreedToNotice: true,
			createdAt: now.toISOString(),
			updatedAt: now.toISOString()
		});
		expect(enrollment.personal.name).toBe('张三');
		expect(enrollment.extra.tshirt).toBe('M');
	});

	it('forces online learningMode for online courses', () => {
		const online = mockCourses[0];
		const enrollment = toEnrollment(
			online,
			{
				personal: validOfflineDraft.personal,
				learningMode: 'offline',
				extra: {},
				agreedToNotice: true
			},
			'enr-2'
		);
		expect(enrollment.learningMode).toBe('online');
	});
});
