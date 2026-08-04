# 学习培训申请功能 — 设计说明

> 候选人：郑嘉颖  
> 题目：通用学习培训申请功能  
> 技术栈：TypeScript · SvelteKit · Tailwind CSS · Vitest · Apache ECharts  
> 约束：**不得**使用 React / Vue / Angular

---

## 1. 需求理解

实现一套可复用的**培训课程报名流程**，课程支持**线上**和/或**线下**学习。

| #   | 需求要点                                    | 理解与实现口径                                 |
| --- | ------------------------------------------- | ---------------------------------------------- |
| 1   | 课程列表 + 报名；开课前一天可改部分报名信息 | 课程用 mock 展示，**不做**课程创建/管理 CRUD   |
| 2   | 个人信息（姓名、电话、地址等）              | 多步向导第 1 步                                |
| 3   | 线下需选培训地点与时间；地点有人数上限      | 对照已有报名（mock）校验剩余名额               |
| 4   | 填写后预览；有问题跳回对应表单修改          | 预览步 + 跳转到对应 step                       |
| 5   | 组件可复用；特殊活动可在第 3 步加字段       | 第 3 步由**字段 schema** 驱动，而非写死表单项  |
| 6   | 学员申请统计报表（可用 mock）               | Apache ECharts 出图                            |
| 7   | 组件需单元测试                              | Vitest（必要时配合 `@testing-library/svelte`） |

**明确不做：** 课程后台管理、真实后端/鉴权、支付。

---

## 2. 领域模型与补充字段

题面要求思考还需补充哪些字段，建议模型如下。

### 课程 Course（mock）

| 字段                         | 说明                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `id`、`title`、`description` | 展示用                                                        |
| `mode`                       | `online` \| `offline` \| `hybrid`                             |
| `startAt`、`endAt`           | 用于「开课前一天可编辑」判定                                  |
| `venues[]`                   | 线下/混合：`{ id, name, address, capacity, sessions[] }`      |
| 各地点 `sessions[]`          | `{ id, startsAt, endsAt, seatsLeft }`（或由报名数据推导余量） |
| `extraFieldSchema[]`         | 可选，活动专属字段，供第 3 步渲染                             |
| `notice`                     | 报名须知 / 勾选同意文案                                       |

### 报名 Enrollment（申请单）

| 字段                       | 说明                                                   |
| -------------------------- | ------------------------------------------------------ |
| `id`、`courseId`、`status` | `draft` \| `submitted` \| `cancelled`                  |
| `personal`                 | `name`、`phone`、`email`、`address`，可选 `employeeId` |
| `learningMode`             | 课程为 hybrid 时用户选择的学习方式                     |
| `venueId`、`sessionId`     | 线下（或 hybrid 选线下）时必填                         |
| `extra`                    | `Record<string, unknown>`，按 schema 字段 id 存值      |
| `agreedToNotice`           | 是否同意须知                                           |
| `createdAt`、`updatedAt`   | 审计时间                                               |
| `editableUntil`            | 派生：`course.startAt - 1 天`                          |

### 业务规则

1. **可编辑窗口：** 报名后，仅当 `now < startAt - 1 天` 时可改**部分**字段；否则只读。
2. **名额：** 提交或变更地点/场次时，不得超过剩余座位。
3. **线上：** 不展示地点/场次；若有 `extraFieldSchema`，仍走第 3 步扩展字段。
4. **预览：** 校验各步；有误展示错误并提供「回到第 N 步」。

---

## 3. 架构

```
┌─────────────────────────────────────────────────────────┐
│  SvelteKit（文件系统路由）+ Tailwind                      │
├─────────────────────────────────────────────────────────┤
│  页面                                                    │
│   /                 → 重定向到 /courses                   │
│   /courses          → 课程列表                            │
│   /apply/[courseId] → 多步向导 + 预览                     │
│   /applications     → 我的报名（可编辑则进入修改）         │
│   /stats            → ECharts 统计报表                    │
├─────────────────────────────────────────────────────────┤
│  领域层（纯 TypeScript，便于单测）                         │
│   类型 · mock · 校验 · 可编辑窗口 · 名额计算               │
├─────────────────────────────────────────────────────────┤
│  UI 组件（可复用、schema 驱动表单）                        │
│   Stepper · FormField* · PreviewPanel · CourseCard       │
└─────────────────────────────────────────────────────────┘
```

**数据：** 内存 / `localStorage` mock，无真实 API。报表可读同一 store，或另备一份 mock 统计数据，保证图表在报名样本较少时仍有可演示效果。

**选用 SvelteKit 的原因：** 满足题面指定栈；文件系统路由与布局适合小型多页应用；且不依赖 React/Vue。

---

## 4. 用户流程

### 报名

```
课程列表 → 选择课程 → 向导
  第 1 步 个人信息
  第 2 步 学习方式（线下则选地点/场次）
  第 3 步 扩展/活动字段（schema 驱动；按题面也可与地点时间同属「详情步」）
  第 4 步 预览 → 提交 → 我的报名列表
```

> 题面将「地点与时间」放在第 3 点，并说明特殊活动字段也加在该步。实现上采用**一个可配置的「详情步」**（学习方式 + 地点/场次 + `extraFieldSchema`），便于复用与扩展。

### 修改

```
我的报名 → 打开某条申请
  若仍可编辑 → 同一向导（预填），限制可改字段
  否则 → 只读详情
```

### 统计

```
/stats → 可选筛选 → ECharts：按课程 / 地点 / 学习方式 / 时间趋势
```

---

## 5. 复用与扩展（对应需求第 5 点）

**Schema 驱动字段**示例：

```ts
type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'checkbox';

interface ExtraFieldSchema {
	id: string;
	label: string;
	type: FieldType;
	required?: boolean;
	options?: { label: string; value: string }[]; // select 用
}
```

- `DynamicForm` 根据 `ExtraFieldSchema[]` 渲染。
- 特殊活动只需改**课程 mock 数据**，不必新建页面。
- 共用组件：`TextField`、`SelectField`、`Stepper`、`PreviewSection`（点击 → 跳到对应 step）。

---

## 6. 统计报表（ECharts）

建议图表（便于 mock）：

1. **各课程报名量**（柱状图）
2. **线上 vs 线下**占比（饼图/环图）
3. **各地点报名 vs 容量**（柱状图）
4. **按日报名趋势**（折线图）

在 `onMount` 中初始化图表，销毁时 `dispose`；option 组装做成纯函数，便于 Vitest 断言。

---

## 7. 测试策略

| 层级   | 测什么                                           | 工具                               |
| ------ | ------------------------------------------------ | ---------------------------------- |
| 领域层 | 可编辑窗口、名额、校验、schema → 取值            | Vitest                             |
| 组件   | Stepper 切换、DynamicForm 必填错误、预览跳转目标 | Vitest + `@testing-library/svelte` |
| 页面   | 可选冒烟，非重点                                 | —                                  |

优先覆盖：**业务规则 + 可复用表单组件**，对应题面「组件需要单元测试」。

---

## 8. 项目目录骨架

```
interview-coding/
├── docs/
│   ├── 面试线下coding需求.txt      # 原始题面
│   └── DESIGN.md                   # 本文档
├── README.md                       # 启动/测试说明（随应用补充）
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── app.html
    ├── app.css                     # Tailwind 入口
    ├── lib/
    │   ├── types/
    │   │   └── enrollment.ts       # Course、Venue、Enrollment、ExtraFieldSchema
    │   ├── mock/
    │   │   ├── courses.ts
    │   │   └── stats.ts
    │   ├── domain/
    │   │   ├── editWindow.ts       # canEdit(enrollment, course, now)
    │   │   ├── capacity.ts         # remainingSeats / assertCanBook
    │   │   └── validate.ts         # 分步校验
    │   ├── stores/
    │   │   └── applications.ts     # 报名列表 CRUD（mock 持久化）
    │   ├── components/
    │   │   ├── CourseCard.svelte
    │   │   ├── Stepper.svelte
    │   │   ├── DynamicForm.svelte
    │   │   ├── fields/
    │   │   │   ├── TextField.svelte
    │   │   │   ├── SelectField.svelte
    │   │   │   └── CheckboxField.svelte
    │   │   ├── PreviewPanel.svelte
    │   │   └── charts/
    │   │       └── ChartHost.svelte
    │   └── utils/
    │       └── dates.ts
    ├── routes/
    │   ├── +layout.svelte          # 导航壳
    │   ├── +page.svelte            # → /courses
    │   ├── courses/
    │   │   └── +page.svelte
    │   ├── apply/
    │   │   └── [courseId]/
    │   │       └── +page.svelte    # 向导 + 预览
    │   ├── applications/
    │   │   ├── +page.svelte
    │   │   └── [id]/
    │   │       └── +page.svelte    # 编辑 / 详情
    │   └── stats/
    │       └── +page.svelte
    └── tests/                      # 或与源码同目录 *.spec.ts
        ├── domain/
        │   ├── editWindow.spec.ts
        │   ├── capacity.spec.ts
        │   └── validate.spec.ts
        └── components/
            ├── Stepper.spec.ts
            └── DynamicForm.spec.ts
```

---

## 9. 交付验收清单（给评审）

- [ ] 可浏览 mock 课程并开始报名
- [ ] 线上/线下路径正确；地点名额受控
- [ ] 多步表单 → 预览 → 跳回修改 → 提交
- [ ] 仅开课前一天之前允许修改
- [ ] 详情步通过 schema 扩展字段（至少一门演示课带自定义字段）
- [ ] `/stats` ECharts 报表
- [ ] `npm test`（Vitest）覆盖领域层与关键组件
- [ ] 依赖中无 React / Vue / Angular

---

## 10. 假设

1. 浏览器内单用户演示；「他人占用名额」用 mock 数据体现。
2. 「可修改的部分报名信息」：联系方式 + 地点/场次 + 扩展字段；课程本身不可换。
3. 界面文案以中文为主（与题面一致）。
4. 若脚手架默认 Svelte 5，优先用 runes（`$state`）；否则用经典 store，本题均可接受。
