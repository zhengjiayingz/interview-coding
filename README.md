# 学习培训申请（面试 Coding Challenge）

通用学习培训申请功能：课程列表报名、多步表单、预览回跳、线下地点名额、统计报表与单元测试。

设计说明见 [`docs/DESIGN.md`](./docs/DESIGN.md)，原始题面见 [`docs/面试线下coding需求.txt`](./docs/面试线下coding需求.txt)。

## 技术栈

- TypeScript
- SvelteKit（Svelte 5）
- Tailwind CSS
- Vitest
- Apache ECharts

未使用 React / Vue / Angular。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`），会进入课程列表。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建结果 |
| `npm test` | 跑 Vitest：领域单测（Node）+ 组件测（happy-dom） |
| `npm run test:unit` | Vitest watch |
| `npm run check` | `svelte-check` 类型检查 |
| `npm run lint` / `npm run format` | ESLint / Prettier |

## 当前进度（骨架）

已搭好：

- 路由：`/courses`、`/apply/[courseId]`、`/applications`、`/stats`
- 领域类型、可编辑窗口 / 名额 / 校验骨架
- schema 驱动 `DynamicForm`、预览面板、ECharts 宿主
- mock 课程与报表数据、报名 `localStorage` store
- 领域层单测示例

待完善：完整提交与修改流程、线下地点/场次交互、详情步校验、组件单测补齐。

## 页面入口

- `/courses` — 课程列表  
- `/apply/:courseId` — 报名向导  
- `/applications` — 我的报名  
- `/stats` — 统计报表  
