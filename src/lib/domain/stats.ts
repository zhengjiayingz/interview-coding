/**
 * 从真实报名列表聚合报表数据（供 ECharts 使用）。
 */
import type { Course, Enrollment } from '$lib/types/enrollment';

export type EnrollmentStats = {
	byCourse: { name: string; count: number }[];
	byMode: { name: string; value: number }[];
	byVenue: { name: string; enrolled: number; capacity: number }[];
	byDay: { date: string; count: number }[];
};

function dayKey(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

/** 统计用：忽略已取消；其余状态计入 */
function countable(list: Enrollment[]): Enrollment[] {
	return list.filter((e) => e.status !== 'cancelled');
}

export function buildEnrollmentStats(
	enrollments: Enrollment[],
	courses: Course[]
): EnrollmentStats {
	const list = countable(enrollments);

	const byCourse = courses.map((c) => ({
		name: c.title,
		count: list.filter((e) => e.courseId === c.id).length
	}));

	let online = 0;
	let offline = 0;
	for (const e of list) {
		if (e.learningMode === 'offline') offline += 1;
		else online += 1;
	}
	const byMode = [
		{ name: '线上', value: online },
		{ name: '线下', value: offline }
	];

	const venueMeta = new Map<string, { name: string; capacity: number }>();
	for (const c of courses) {
		for (const v of c.venues) {
			venueMeta.set(v.id, { name: v.name, capacity: v.capacity });
		}
	}
	const venueCounts = new Map<string, number>();
	for (const e of list) {
		if (!e.venueId) continue;
		venueCounts.set(e.venueId, (venueCounts.get(e.venueId) ?? 0) + 1);
	}
	const byVenue = [...venueMeta.entries()].map(([id, meta]) => ({
		name: meta.name,
		enrolled: venueCounts.get(id) ?? 0,
		capacity: meta.capacity
	}));

	const dayCounts = new Map<string, number>();
	for (const e of list) {
		const key = dayKey(e.createdAt);
		dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
	}
	const byDay = [...dayCounts.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, count]) => ({ date, count }));

	// 无报名时 byDay 为空，图表仍可渲染空序列
	return { byCourse, byMode, byVenue, byDay };
}
