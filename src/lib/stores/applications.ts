import { browser } from '$app/environment';
import type { Enrollment } from '$lib/types/enrollment';
// Svelte 的可写共享状态，有点像：React 的 Context + state
import { writable } from 'svelte/store';

const STORAGE_KEY = 'training-applications';

function loadInitial(): Enrollment[] {
	/** 如果不在浏览器环境下（而是在服务端SSR环境下），返回空数组，浏览器才有localStorage */
	if (!browser) return [];
	try {
		//! 从 localStorage 中获取报名数据
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Enrollment[]) : [];
	} catch {
		return [];
	}
}

function persist(list: Enrollment[]) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function createApplicationsStore() {
	//! 创建一个可写共享状态，初始值为 loadInitial() 返回的数组
	// subscribe: 订阅状态变化
	// set: 设置状态，这里这个set方法已经是类似于pinia的内存状态管理了，只不过我这里额外调用persist方法保存到localStorage
	// update: 更新状态
	const { subscribe, set, update } = writable<Enrollment[]>(loadInitial());

	return {
		//! 没有页面写 applications.subscribe。模板里的 $applications 会由 Svelte 自动调用 subscribe
		subscribe,
		set(list: Enrollment[]) {
			persist(list);
			set(list);
		},
		upsert(enrollment: Enrollment) {
			update((list) => {
				const idx = list.findIndex((e) => e.id === enrollment.id);
				const next =
					idx >= 0
						? list.map((e, i) => (i === idx ? enrollment : e))
						: [...list, enrollment];
				//! 保存报名信息到localStorage
				persist(next);
				return next;
			});
		},
		remove(id: string) {
			update((list) => {
				const next = list.filter((e) => e.id !== id);
				persist(next);
				return next;
			});
		},
		reload() {
			set(loadInitial());
		}
	};
}

export const applications = createApplicationsStore();
