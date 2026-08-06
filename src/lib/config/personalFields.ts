/**
 * 个人信息表单字段配置（配置驱动 UI + 校验）
 * 增删字段、改必填/格式规则优先改这里；validatePersonal 按本配置执行。
 * UI 由 DynamicForm 按 type 渲染（与课程 extraFieldSchema 共用同一组件）。
 */
import type { ExtraFieldSchema, PersonalInfo } from '$lib/types/enrollment';

export type PersonalFieldId = keyof Pick<PersonalInfo, 'name' | 'phone' | 'email' | 'address'>;

/** 个人信息字段 = ExtraFieldSchema + 可选格式校验 */
export type PersonalFieldSchema = ExtraFieldSchema & {
	id: PersonalFieldId;
	/** 有值时校验格式；空值且非 required 则跳过（主要用于 text） */
	pattern?: RegExp;
	patternMessage?: string;
};

/** 中国大陆手机号：1 开头，第二位 3–9，共 11 位 */
const PHONE_RE = /^1[3-9]\d{9}$/;

/** 常见邮箱格式 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 报名 / 修改报名共用的个人信息字段定义 */
export const personalInfoFields: PersonalFieldSchema[] = [
	{ id: 'name', label: '姓名', type: 'text', required: true },
	{
		id: 'phone',
		label: '联系电话',
		type: 'text',
		required: true,
		pattern: PHONE_RE,
		patternMessage: '请输入有效的 11 位手机号'
	},
	{
		id: 'email',
		label: '邮箱',
		type: 'text',
		required: false,
		pattern: EMAIL_RE,
		patternMessage: '请输入有效的邮箱地址'
	},
	{ id: 'address', label: '地址', type: 'text', required: true }
];

/** 预览/列表展示用：select 显示 option label，空值用 — */
export function personalFieldDisplayValue(
	field: PersonalFieldSchema,
	personal: PersonalInfo
): string {
	const raw = String(personal[field.id] ?? '').trim();
	if (!raw) return '—';
	if (field.type === 'select' && field.options) {
		return field.options.find((o) => o.value === raw)?.label ?? raw;
	}
	return raw;
}
