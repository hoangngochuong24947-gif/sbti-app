# SBTI Project Foundation

## Goal
使用 `Vite + React + TypeScript + CSS Modules` 复刻 SBTI 前端页面，优先保证视觉还原度、页面结构和结果流程完整可跑。

## Fixed Decisions
- 框架固定为 `Vite + React + TypeScript`
- 样式固定为 `CSS Modules + src/styles/tokens.css`
- 第一版固定为单页应用，不使用 React Router 作为主流程
- 运行时固定为纯前端本地 mock，不依赖真实后端
- 评分逻辑固定以 `../core.html` 内联脚本为真源
- `../index.js` 和 `../index_native.js` 视为配置/监控层，不纳入业务运行时

## Source Of Truth
- 页面结构与核心评分逻辑：`../core.html`
- 27 种人格长文案补充：`../SBTI (Silly Big Personality Test) 27 种人格资料全集.pdf`
- 作者文案：`../writerspeak.md`
- 视觉基准：`../答题页面风格.png`、`../结算页面风格.png`

## Implementation Boundaries
- 不重写题意，不二创题目内容
- 不发明新的结果算法，优先复刻已有维度累计和人格匹配逻辑
- 不接入 B 站埋点、跳 App、远端配置拉取
- 不做“现代化重设计”，优先保留原站的浅灰绿底色、大圆角、淡描边和轻阴影

## App Shape
- `intro`: 开场页
- `test`: 问卷页
- `result`: 结果页

## Data Modules
- `src/data/generated/questions.ts`
- `src/data/generated/dimensions.ts`
- `src/data/generated/types.ts`
- `src/data/generated/meta.ts`

这些文件由 `npm run extract:data` 从现有素材生成，不手工维护大块文案。

## Engineering Rules
- 组件只处理展示和交互，不直接持有原始解析逻辑
- 评分逻辑集中在 `src/lib/quizEngine.ts`
- 页面切换与答题状态集中在应用层
- 任何完成声明之前必须跑测试和构建
