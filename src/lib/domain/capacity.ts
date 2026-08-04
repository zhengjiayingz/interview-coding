/**
 * 领域：线下培训名额
 *
 * 题面规则 —— 培训地点可有多个，且各有人数限制。
 * 余量 = 场次容量（或回退到地点 capacity）− 同课程同地点同场次已提交报名数。
 * 修改已有报名时传入 `excludeEnrollmentId`，避免把自己占的那一席算进「已占用」。
 */
import type { Course, Enrollment } from '$lib/types/enrollment';

/** 计算某课程某地点某场次的剩余座位；地点/场次不存在时视为 0 */
export function remainingSeats(
	course: Course,
	venueId: string,
	sessionId: string,
	enrollments: Enrollment[],
	excludeEnrollmentId?: string
): number {
	const venue = course.venues.find((v) => v.id === venueId);
	if (!venue) return 0;

	const session = venue.sessions.find((s) => s.id === sessionId);
	if (!session) return 0;

	// 只统计「已提交」占用；草稿不占名额
	const taken = enrollments.filter(
		(e) =>
			e.id !== excludeEnrollmentId &&
			e.status === 'submitted' &&
			e.courseId === course.id &&
			e.venueId === venueId &&
			e.sessionId === sessionId
	).length;

	// 优先用场次上的 seatsLeft；未配置则用地点总容量
	const capacity = session.seatsLeft ?? venue.capacity;
	return Math.max(0, capacity - taken);
}

/** 提交/改场次前调用；无名额则抛错，由页面捕获提示用户 */
export function assertCanBook(
	course: Course,
	venueId: string,
	sessionId: string,
	enrollments: Enrollment[],
	excludeEnrollmentId?: string
): void {
	if (remainingSeats(course, venueId, sessionId, enrollments, excludeEnrollmentId) <= 0) {
		throw new Error('该场次名额已满');
	}
}
