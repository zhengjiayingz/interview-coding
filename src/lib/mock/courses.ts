import type { Course } from '$lib/types/enrollment';

/** 课程 mock：后续按业务补全场次与扩展字段示例 */
export const mockCourses: Course[] = [
	{
		id: 'c-online-lock-demo',
		title: '新员工入职合规速览（线上）',
		description:
			'开课时间为 8 月 8 日 08:00。可编辑截止为开课前一天同钟点（8/7 08:00），面试当天白天报名详情应为只读。',
		mode: 'online',
		startAt: '2026-08-08T08:00:00+08:00',
		endAt: '2026-08-08T12:00:00+08:00',
		venues: [],
		extraFieldSchema: [],
		notice: '请确保报名信息真实有效。本课程用于演示「开课前一天之后不可修改」。'
	},
	{
		id: 'c-online-1',
		title: '信息安全意识培训（线上）',
		description: '面向全员的安全基础课程，支持在线自学。',
		mode: 'online',
		startAt: '2026-09-15T09:00:00+08:00',
		endAt: '2026-09-15T12:00:00+08:00',
		venues: [],
		extraFieldSchema: [],
		notice:
			'请确保报名信息真实有效。\n\n本课程为线上自学，请在开课前完成账号准备，并遵守学习平台使用规范。'
	},
	{
		id: 'c-offline-1',
		title: '客户服务沟通技巧（线下）',
		description: '线下工作坊，需选择培训地点与场次。',
		mode: 'offline',
		startAt: '2026-09-20T14:00:00+08:00',
		endAt: '2026-09-20T17:00:00+08:00',
		venues: [
			{
				id: 'v-gz',
				name: '广州培训中心',
				address: '广州市天河区示例路 1 号',
				capacity: 2,
				sessions: [
					{
						id: 's-gz-1',
						startsAt: '2026-09-20T14:00:00+08:00',
						endsAt: '2026-09-20T17:00:00+08:00',
						seatsLeft: 2
					}
				]
			},
			{
				id: 'v-sz',
				name: '深圳培训中心',
				address: '深圳市南山区示例大道 88 号',
				capacity: 1,
				sessions: [
					{
						id: 's-sz-1',
						startsAt: '2026-09-20T14:00:00+08:00',
						endsAt: '2026-09-20T17:00:00+08:00',
						seatsLeft: 1
					}
				]
			}
		],
		extraFieldSchema: [
			{
				id: 'dietary',
				label: '饮食禁忌',
				type: 'text',
				required: false
			},
			{
				id: 'tshirt',
				label: 'T 恤尺码',
				type: 'select',
				required: true,
				options: [
					{ label: 'S', value: 'S' },
					{ label: 'M', value: 'M' },
					{ label: 'L', value: 'L' },
					{ label: 'XL', value: 'XL' }
				]
			}
		],
		notice:
			'请提前 15 分钟到场签到。\n\n请携带工牌，服从现场工作人员安排。若因故无法参加，请在可编辑窗口内及时修改或取消报名，以免占用名额。'
	}
];

export function getCourseById(id: string): Course | undefined {
	return mockCourses.find((c) => c.id === id);
}
