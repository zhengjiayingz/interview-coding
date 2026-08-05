/**
 * 领域：报名表单校验
 *
 * 按向导步骤拆分：个人信息一步、培训详情一步（方式 / 地点场次 / schema 扩展字段）。
 * 返回 `字段 id → 错误文案`；空对象表示该步通过。页面用其高亮错误并阻止进入预览/提交。
 */
import type { Course, Enrollment, PersonalInfo } from '$lib/types/enrollment';

/** 单步校验错误表：key 为表单字段名 */
export type StepErrors = Record<string, string>;

/** 中国大陆手机号：1 开头，第二位 3–9，共 11 位 */
const PHONE_RE = /^1[3-9]\d{9}$/;

/** 常见邮箱格式（非空时校验；空邮箱仍视为可选） */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 第 1 步：姓名、电话、地址必填；电话/邮箱做格式校验（邮箱可空） */
export function validatePersonal(personal: PersonalInfo): StepErrors {
	const errors: StepErrors = {};
	if (!personal.name?.trim()) errors.name = '请填写姓名';

	const phone = personal.phone?.trim() ?? '';
	if (!phone) {
		errors.phone = '请填写联系电话';
	} else if (!PHONE_RE.test(phone)) {
		errors.phone = '请输入有效的 11 位手机号';
	}

	const email = personal.email?.trim() ?? '';
	if (email && !EMAIL_RE.test(email)) {
		errors.email = '请输入有效的邮箱地址';
	}

	if (!personal.address?.trim()) errors.address = '请填写地址';
	return errors;
}

type DetailsDraft = Pick<
	Enrollment,
	'learningMode' | 'venueId' | 'sessionId' | 'extra' | 'agreedToNotice'
>;

/** 是否需要选择线下地点/场次 */
function needsVenueSession(course: Course, learningMode: Enrollment['learningMode']): boolean {
	if (course.mode === 'offline') return true;
	if (course.mode === 'hybrid' && learningMode === 'offline') return true;
	return false;
}

/**
 * 第 2 步（详情）：学习方式 / 线下地点与场次 / 课程 extraFieldSchema / 须知同意。
 */
export function validateDetails(course: Course, draft: DetailsDraft): StepErrors {
	const errors: StepErrors = {};

	if (!draft.learningMode) {
		errors.learningMode = '请选择学习方式';
	}

	if (needsVenueSession(course, draft.learningMode)) {
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
		errors.agreedToNotice = '请同意报名须知';
	}

	return errors;
}
