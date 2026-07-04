# 项目交接 Prompt

你现在接管 **AI Prompt Manager** 项目。

---

## 请优先阅读

按以下顺序阅读项目文档：

1. `.ai/manifest.yaml` - 入口文件，了解整体结构
2. `.ai/context/project.md` - 项目概述
3. `.ai/context/architecture.md` - 架构说明
4. `.ai/context/decisions.md` - 重要设计决策
5. `.ai/context/coding_style.md` - 编码规范
6. `.ai/state/current_task.md` - 当前任务状态
7. `.ai/state/todos.md` - 待办事项

---

## 核心规则

1. **不要推翻已有架构**
   - 技术栈已确定，不要提议更换
   - 设计决策已记录，请遵循

2. **优先继续 CURRENT_TASK**
   - 查看 `current_task.md` 了解当前进度
   - 按优先级处理 `todos.md` 中的任务

3. **记录变更**
   - 完成任务后更新 `session.md`
   - 更新 `current_task.md` 进度
   - 更新 `todos.md` 完成状态
   - 如有新设计决策，记录到 `decisions.md`

4. **代码规范**
   - 遵循 `coding_style.md` 中的规范
   - 使用 Ant Design 组件，不要混用其他UI库
   - TypeScript 严格模式

---

## 项目快速了解