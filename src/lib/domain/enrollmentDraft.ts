/**
 * 领域：报名草稿 → 提交
 *
 * 汇总个人/详情校验，线下再校验名额，通过后把草稿转成正式 Enrollment。
 * 页面提交与「修改后保存」共用，避免规则散落在组件里。
 */
import type { Course, Enrollment, PersonalInfo } from '$lib/types/enrollment';
import { assertCanBook } from './capacity';
import { validateDetails, validatePersonal } from './validate';

/** 向导中尚未落库的报名草稿 */
export type EnrollmentDraft = {
	personal: PersonalInfo;
	learningMode: Enrollment['learningMode'];
	venueId?: string;
	sessionId?: string;
	extra: Record<string, unknown>;
	agreedToNotice: boolean;
};

/**
 * 提交前总闸门：表单完整 +（如需）名额足够。
 * @param excludeEnrollmentId 修改已有报名时排除自己，避免名额被自己占满
 */
export function assertReadyToSubmit(
	course: Course,
	draft: EnrollmentDraft,
	enrollments: Enrollment[],
	excludeEnrollmentId?: string
): void {
	const pErr = validatePersonal(draft.personal);
	const dErr = validateDetails(course, draft);
	if (Object.keys(pErr).length || Object.keys(dErr).length) {
		throw new Error('表单未填写完整');
	}

	const offline = course.mode === 'offline';
	if (offline && draft.venueId && draft.sessionId) {
		assertCanBook(course, draft.venueId, draft.sessionId, enrollments, excludeEnrollmentId);
	}
}

/** 草稿转为已提交的报名单（不负责写入 store） */
export function toEnrollment(
	course: Course,
	draft: EnrollmentDraft,
	id: string,
	now = new Date()
): Enrollment {
	const iso = now.toISOString();
	return {
		id,
		courseId: course.id,
		status: 'submitted',
		personal: { ...draft.personal },
		learningMode: course.mode,
		venueId: draft.venueId,
		sessionId: draft.sessionId,
		extra: { ...draft.extra },
		agreedToNotice: draft.agreedToNotice,
		createdAt: iso,
		updatedAt: iso
	};
}
