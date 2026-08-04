/**
 * 领域：报名可编辑窗口
 *
 * 题面规则 —— 课程开始前一天之前，允许修改部分报名信息；
 * 到期后详情页只读。本模块只算时间窗口，不关心改哪些字段。
 */
import type { Course } from '$lib/types/enrollment';

/** 可编辑截止时刻：开课日 `startAt` 往前推 1 个自然日（同钟点） */
export function getEditableUntil(course: Course): Date {
	const start = new Date(course.startAt);
	const until = new Date(start);
	until.setDate(until.getDate() - 1);
	return until;
}

/**
 * 当前是否仍可改报名。
 * @param now 可注入「当前时间」，便于单测卡边界，默认 `new Date()`
 */
export function canEdit(course: Course, now: Date = new Date()): boolean {
	return now.getTime() < getEditableUntil(course).getTime();
}
