/** 报表用 mock，保证演示时图表有数据 */
export const mockStats = {
	byCourse: [
		{ name: '信息安全意识培训（线上）', count: 42 },
		{ name: '客户服务沟通技巧（线下）', count: 28 }
	],
	byMode: [
		{ name: '线上', value: 42 },
		{ name: '线下', value: 28 }
	],
	byVenue: [
		{ name: '广州培训中心', enrolled: 18, capacity: 30 },
		{ name: '深圳培训中心', enrolled: 10, capacity: 20 }
	],
	byDay: [
		{ date: '2026-08-01', count: 5 },
		{ date: '2026-08-02', count: 8 },
		{ date: '2026-08-03', count: 12 },
		{ date: '2026-08-04', count: 7 }
	]
};
