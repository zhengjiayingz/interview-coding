# 学习培训申请 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有 SvelteKit 骨架上打通可演示的报名闭环（列表 → 向导 → 提交 → 我的报名 → 可编辑窗口内修改 → 报表仍可用 mock），并保证你 8 月 7 日正式讲解时能说清结构与实现细节。

**Architecture:** 页面只负责交互；业务规则放在 `src/lib/domain/`（可编辑窗口、名额、分步校验）；报名数据经 `src/lib/stores/applications.ts` 持久化到 `localStorage`；第 2 步用课程 `extraFieldSchema` + 地点/场次表单组合，预览步可跳回修改。

**Tech Stack:** TypeScript · SvelteKit (Svelte 5) · Tailwind · Vitest · Apache ECharts（报表已有，本计划不重做 UI）

**Presentation deadline:** 2026-08-07（正式讲思路 + 实现细节）  
**节奏：** 不赶工；先稳 MVP，再留缓冲练口述与查漏。  
**UI：** 本计划不纠结视觉，保持现状即可。

---

## 当前基线（已有，勿重复搭）

| 已有 | 路径 |
|------|------|
| 设计说明 | `docs/DESIGN.md` |
| 类型 | `src/lib/types/enrollment.ts` |
| 可编辑窗口 | `src/lib/domain/editWindow.ts` + `src/tests/domain/editWindow.spec.ts` |
| 名额 | `src/lib/domain/capacity.ts` + `src/tests/domain/capacity.spec.ts` |
| 校验骨架 | `src/lib/domain/validate.ts` + `src/tests/domain/validate.spec.ts` |
| mock 课程/报表 | `src/lib/mock/courses.ts`, `src/lib/mock/stats.ts` |
| store | `src/lib/stores/applications.ts` |
| 向导壳 | `src/routes/apply/[courseId]/+page.svelte`（未真正提交） |
| 报表页 | `src/routes/stats/+page.svelte` |

**验收口诀（做完应对齐）：** 能报名、能占名额、能预览回改、能提交进列表、开课前一天前能改、超期只读。

---

## 建议日程（对照 8/7 正式讲解，可按精力微调）

| 日期 | 做什么 |
|------|--------|
| 8/4～8/5 | Task 1～5：校验 + 地点场次 + 预览 + 提交进列表（核心闭环） |
| 8/5～8/6 | Task 6～7：可编辑窗口修改 + 补测；有余力再打磨细节 |
| 8/6 晚或 8/7 上午 | Task 8：写讲解提纲 + 完整走演示；正式讲前再过一遍口述 |

---

### Task 1: 补全分步校验（个人 + 详情）

**Files:**
- Modify: `src/lib/domain/validate.ts`
- Modify: `src/tests/domain/validate.spec.ts`

**Step 1: 先写失败用例（详情步）**

在 `validate.spec.ts` 追加：

```ts
import { validateDetails } from '$lib/domain/validate';
import type { Course } from '$lib/types/enrollment';

const offlineCourse = {
	id: 'c-off',
	title: 't',
	description: 'd',
	mode: 'offline',
	startAt: '2026-09-20T14:00:00+08:00',
	endAt: '2026-09-20T17:00:00+08:00',
	venues: [
		{
			id: 'v1',
			name: 'A',
			address: 'addr',
			capacity: 2,
			sessions: [
				{
					id: 's1',
					startsAt: '2026-09-20T14:00:00+08:00',
					endsAt: '2026-09-20T17:00:00+08:00'
				}
			]
		}
	],
	extraFieldSchema: [
		{ id: 'tshirt', label: 'T恤', type: 'select', required: true, options: [{ label: 'M', value: 'M' }] }
	],
	notice: '须知'
} satisfies Course;

it('offline requires venue and session', () => {
	const errors = validateDetails(offlineCourse, {
		learningMode: 'offline',
		venueId: undefined,
		sessionId: undefined,
		extra: {},
		agreedToNotice: true
	});
	expect(errors.venueId).toBeTruthy();
	expect(errors.sessionId).toBeTruthy();
});

it('requires schema required extras', () => {
	const errors = validateDetails(offlineCourse, {
		learningMode: 'offline',
		venueId: 'v1',
		sessionId: 's1',
		extra: {},
		agreedToNotice: true
	});
	expect(errors.tshirt).toBeTruthy();
});
```

**Step 2: 跑测确认失败**

```bash
npm test -- src/tests/domain/validate.spec.ts
```

Expected: FAIL（`validateDetails` 仍返回 `{}`）

**Step 3: 实现 `validateDetails`**

```ts
export function validateDetails(
	course: Course,
	draft: Pick<Enrollment, 'learningMode' | 'venueId' | 'sessionId' | 'extra' | 'agreedToNotice'>
): StepErrors {
	const errors: StepErrors = {};
	const mode = draft.learningMode;

	if (!mode) errors.learningMode = '请选择学习方式';

	const needVenue = mode === 'offline' || (course.mode === 'hybrid' && mode === 'offline');
	// 简化：course.mode === 'offline' 时强制线下
	const offline =
		course.mode === 'offline' || (course.mode === 'hybrid' && draft.learningMode === 'offline');

	if (offline) {
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
```

（实现时删掉未使用的 `needVenue` 变量，保持 lint 干净。）

**Step 4: 再跑测**

```bash
npm test -- src/tests/domain/validate.spec.ts
```

Expected: PASS

**Step 5: Commit（若你在用 git）**

```bash
git add src/lib/domain/validate.ts src/tests/domain/validate.spec.ts
git commit -m "feat: complete enrollment step validation"
```

---

### Task 2: 抽出报名草稿状态与提交辅助函数

**Files:**
- Create: `src/lib/domain/enrollmentDraft.ts`
- Create: `src/tests/domain/enrollmentDraft.spec.ts`
- Modify: `src/lib/domain/capacity.ts`（若提交前校验要复用 `assertCanBook`，可不改）

**Step 1: 失败测试 — `createEnrollment` / `buildPreviewSections` 可后置；先测「提交前校验汇总」**

```ts
// enrollmentDraft.spec.ts
import { assertReadyToSubmit } from '$lib/domain/enrollmentDraft';
import { mockCourses } from '$lib/mock/courses';
import { describe, expect, it } from 'vitest';

it('throws when personal invalid', () => {
	expect(() =>
		assertReadyToSubmit(mockCourses[1], {
			personal: { name: '', phone: '', email: '', address: '' },
			learningMode: 'offline',
			venueId: 'v-gz',
			sessionId: 's-gz-1',
			extra: { tshirt: 'M' },
			agreedToNotice: true
		}, [])
	).toThrow();
});
```

**Step 2: 跑测应 FAIL（模块不存在）**

```bash
npm test -- src/tests/domain/enrollmentDraft.spec.ts
```

**Step 3: 实现最小模块**

```ts
// src/lib/domain/enrollmentDraft.ts
import { assertCanBook } from './capacity';
import { validateDetails, validatePersonal } from './validate';
import type { Course, Enrollment, PersonalInfo } from '$lib/types/enrollment';

export type EnrollmentDraft = {
	personal: PersonalInfo;
	learningMode: Enrollment['learningMode'];
	venueId?: string;
	sessionId?: string;
	extra: Record<string, unknown>;
	agreedToNotice: boolean;
};

export function assertReadyToSubmit(
	course: Course,
	draft: EnrollmentDraft,
	enrollments: Enrollment[],
	excludeEnrollmentId?: string
): void {
	const pErr = validatePersonal(draft.personal);
	const dErr = validateDetails(course, draft);
	const keys = [...Object.keys(pErr), ...Object.keys(dErr)];
	if (keys.length) throw new Error('表单未填写完整');

	const offline =
		course.mode === 'offline' || (course.mode === 'hybrid' && draft.learningMode === 'offline');
	if (offline && draft.venueId && draft.sessionId) {
		assertCanBook(course, draft.venueId, draft.sessionId, enrollments, excludeEnrollmentId);
	}
}

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
		learningMode: course.mode === 'online' ? 'online' : draft.learningMode,
		venueId: draft.venueId,
		sessionId: draft.sessionId,
		extra: { ...draft.extra },
		agreedToNotice: draft.agreedToNotice,
		createdAt: iso,
		updatedAt: iso
	};
}
```

**Step 4: 测通 + Commit**

```bash
npm test -- src/tests/domain/enrollmentDraft.spec.ts
```

---

### Task 3: 报名页接上「学习方式 / 地点 / 场次」UI

**Files:**
- Modify: `src/routes/apply/[courseId]/+page.svelte`
- Optional Create: `src/lib/components/VenueSessionPicker.svelte`（推荐抽出，方便讲「组件复用」）

**Step 1: 在向导 state 增加字段**

```ts
let learningMode = $state<'online' | 'offline' | 'hybrid'>('offline');
let venueId = $state('');
let sessionId = $state('');
let agreedToNotice = $state(false);
let stepErrors = $state<Record<string, string>>({});
```

进入页面时按 `course.mode` 初始化：`online` → 锁定线上；`offline` → 锁定线下。

**Step 2: 第 2 步 UI 逻辑**

- `online`：不展示地点场次；仍渲染 `DynamicForm` + 须知勾选  
- `offline` / hybrid 选线下：地点 `<select>` → 过滤该点 `sessions` → 场次 `<select>`，展示剩余名额（调用 `remainingSeats(course, venueId, sessionId, $applications)`）  
- 「下一步」前调用 `validateDetails`，有错则 `stepErrors = ...` 并 return  

**Step 3: 手动验证**

```bash
npm run dev
```

打开线下课报名 → 第 2 步能选广州/深圳场次，名额数字有显示。

**Step 4: Commit**

```bash
git add src/routes/apply/[courseId]/+page.svelte src/lib/components/VenueSessionPicker.svelte
git commit -m "feat: add venue and session selection to enroll wizard"
```

---

### Task 4: 预览步展示完整信息 + 校验通过才能进预览

**Files:**
- Modify: `src/routes/apply/[courseId]/+page.svelte`
- Modify: `src/lib/components/PreviewPanel.svelte`（仅当需要更好空态；可不动）

**Step 1: 点「下一步」到预览前**

- Step0：`validatePersonal`  
- Step1：`validateDetails`  
失败则停在当前步并展示错误。

**Step 2: PreviewPanel rows 补全**

除个人信息外增加：学习方式、地点名、场次时间、扩展字段（用 schema 的 `label` 而不是裸 id）、是否同意须知。

**Step 3: 浏览器走通预览「修改此步」能跳回 0/1。**

**Step 4: Commit**

```bash
git commit -am "feat: gate wizard steps with validation and richer preview"
```

---

### Task 5: 真正提交 → store → 跳转我的报名

**Files:**
- Modify: `src/routes/apply/[courseId]/+page.svelte`
- Modify: `src/lib/stores/applications.ts`（若需 `getById` helper 可加）
- Modify: `src/routes/applications/+page.svelte`（确认能列出）

**Step 1: 提交按钮**

```ts
import { goto } from '$app/navigation';
import { applications } from '$lib/stores/applications';
import { assertReadyToSubmit, toEnrollment } from '$lib/domain/enrollmentDraft';
import { get } from 'svelte/store';

function submit() {
	if (!course) return;
	try {
		assertReadyToSubmit(course, draft, get(applications));
		const enrollment = toEnrollment(course, draft, crypto.randomUUID());
		applications.upsert(enrollment);
		goto('/applications');
	} catch (e) {
		alert(e instanceof Error ? e.message : '提交失败');
	}
}
```

**Step 2: 手动验证**

1. 报一名线下课 → 我的报名出现记录  
2. 刷新页面记录仍在（localStorage）  
3. 把某场次 `capacity`/`seatsLeft` 调到 1，连续报两名应第二名失败（可用临时 mock 或测试）

**Step 3: 单测名额占满（若尚未覆盖）**

在 `capacity.spec.ts` 加：两名已报名 capacity=2 时 `remainingSeats === 0`，`assertCanBook` throw。

**Step 4: Commit**

```bash
git commit -am "feat: persist enrollment submit to local store"
```

---

### Task 6: 报名详情页 — 可编辑窗口内修改

**Files:**
- Modify: `src/routes/applications/[id]/+page.svelte`
- Reuse: `canEdit` from `src/lib/domain/editWindow.ts`
- Reuse: 向导组件或在详情页内嵌简化表单（YAGNI：详情页复制第 1/2 步关键字段即可，不必硬抽公共 wizard）

**业务口径（与 DESIGN 一致）：**

- 可改：联系方式、地点/场次、extra  
- 不可改：`courseId`  
- `!canEdit(course)` → 只读  

**Step 1: 可编辑时展示表单 +「保存」**

保存时：

```ts
assertReadyToSubmit(course, draft, get(applications), enrollment.id);
applications.upsert({
	...enrollment,
	...draftFields,
	updatedAt: new Date().toISOString()
});
```

**Step 2: 手动验证**

- 把 mock 课 `startAt` 调到「两天后」→ 可保存  
- 调到「明天内 / 已开课」→ 只读  

**Step 3: Commit**

```bash
git commit -am "feat: allow editing enrollment before edit window closes"
```

---

### Task 7: 补组件/领域测试到「能交差」

**Files:**
- Modify/Create: `src/tests/domain/*.spec.ts`
- Optional: 纯函数测 `remainingSeats` 边界；不必上浏览器测 Svelte

**最低测试清单：**

- [ ] `validatePersonal` / `validateDetails`  
- [ ] `canEdit` 边界  
- [ ] `remainingSeats` / `assertCanBook`  
- [ ] `assertReadyToSubmit` / `toEnrollment`  

```bash
npm test
npm run check
```

Expected: 全绿；`svelte-check` 0 error。

**Commit:**

```bash
git commit -am "test: cover enrollment domain rules"
```

---

### Task 8: 讲解提纲（8/7 正式讲前完成即可）

**Files:**
- Create: `docs/讲解提纲-8月7日.md`

**内容结构（写入该文件，控制口述 8～12 分钟）：**

1. **需求理解**（1 min）：线上/线下、名额、开课前一天可改、预览回跳、schema 扩展、报表、单测  
2. **结构图**（2 min）：`routes` / `domain` / `components` / `stores` / `mock`  
3. **演示路径**（3 min）：报线下课 → 预览改电话 → 提交 → 列表 → 改场次 → 看报表  
4. **实现细节 5 点**（4 min）：  
   - 为什么规则放 domain 不放页面  
   - Fiber 无关；讲 **schema 驱动** 如何满足「特殊活动加字段」  
   - 名额如何算、提交时如何防超卖（mock 场景）  
   - `canEdit = now < startAt - 1day`  
   - store + localStorage 为何够用（无后端约束）  
5. **已知限制**（1 min）：无真实后端、报表仍可部分 mock、未做课程管理（题面允许）

**自测标准：** 不看稿能把 5 个实现点各说清 30 秒。

---

## 明确不做（本计划 YAGNI）

- 课程后台 CRUD  
- 真实登录鉴权 / 支付  
- Playwright 浏览器测  
- 大改 UI / 重做设计系统  
- Redux 级状态方案（继续用现有 store）  
- loader/action 数据路由模式  

---

## 风险与注意

1. **hybrid 课**：MVP 可先只保证 `online` + `offline` 两门 mock；hybrid 有时间再加。  
2. **时区**：`editWindow` 单测已用 ISO；演示时别拿「刚好卡在临界」的本地时间含糊带过，口述说清规则即可。  
3. **讲代码时打开的文件优先**：`validate.ts`、`capacity.ts`、`editWindow.ts`、`apply/[courseId]/+page.svelte`、`applications.ts`。  

---

## 执行方式（你确认计划后）

Plan 保存位置：`docs/plans/2026-08-04-training-enrollment-mvp.md`

你可以：

1. **本会话按 Task 逐个做**（我来改代码，你验收演示）  
2. **新开会话**按 `@docs/plans/2026-08-04-training-enrollment-mvp.md` + executing-plans 批量推进  

看完这份后告诉我：要改优先级 / 砍范围，还是直接从 Task 1 开工。
