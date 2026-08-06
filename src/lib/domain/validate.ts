/**
 * 领域：报名表单校验
 *
 * 按向导步骤拆分：个人信息一步、培训详情一步（方式 / 地点场次 / schema 扩展字段）。
 * 返回 `字段 id → 错误文案`；空对象表示该步通过。页面用其高亮错误并阻止进入预览/提交。
 */
import {
	personalInfoFields,
	type PersonalFieldId
} from '$lib/config/personalFields';
import type { Course, Enrollment, PersonalInfo } from '$lib/types/enrollment';

/** 单步校验错误表：key 为表单字段名 */
export type StepErrors = Record<string, string>;

/** 校验单个个人信息字段；通过返回 null（用于失焦即时反馈） */
export function validatePersonalField(
	fieldId: PersonalFieldId,
	personal: PersonalInfo
): string | null {
	const field = personalInfoFields.find((f) => f.id === fieldId);
	if (!field) return null;

	const value = String(personal[field.id] ?? '').trim();

	if (field.required && !value) {
		return field.type === 'select' ? `请选择${field.label}` : `请填写${field.label}`;
	}

	if (value && field.pattern && !field.pattern.test(value)) {
		return field.patternMessage ?? `${field.label}格式不正确`;
	}

	return null;
}

/**
 * 第 1 步：按 personalInfoFields 配置做必填 + 格式校验。
 * 规则写在配置里，这里只负责执行。
 */
export function validatePersonal(personal: PersonalInfo): StepErrors {
	const errors: StepErrors = {};

	for (const field of personalInfoFields) {
		const message = validatePersonalField(field.id, personal);
		if (message) errors[field.id] = message;
	}

	return errors;
}

type DetailsDraft = Pick<
	Enrollment,
	'learningMode' | 'venueId' | 'sessionId' | 'extra' | 'agreedToNotice'
>;

/** 是否需要选择线下地点/场次（仅线下课） */
function needsVenueSession(course: Course): boolean {
	return course.mode === 'offline';
}

/**
 * 第 2 步（详情）：学习方式 / 线下地点与场次 / 课程 extraFieldSchema / 须知同意。
 */
export function validateDetails(course: Course, draft: DetailsDraft): StepErrors {
	const errors: StepErrors = {};

	if (!draft.learningMode) {
		errors.learningMode = '请选择学习方式';
	}

	if (needsVenueSession(course)) {
		if (!draft.venueId) errors.venueId = '请选择培训地点';
		if (!draft.sessionId) errors.sessionId = '请选择场次时间';
	}

	for (const field of course.extraFieldSchema) {
		if (!field.required) continue;
		const v = draft.extra?.[field.id];
		const empty = v == null || v === '' || v === false;
		if (empty) errors[field.id] = `请填写${field.label}`;
	}

	if (course.notice && !draft.agreedToNotice) {
		errors.agreedToNotice = '请先阅读报名须知';
	}

	return errors;
}
