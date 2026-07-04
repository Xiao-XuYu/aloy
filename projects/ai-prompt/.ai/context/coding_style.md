# 编码规范

## TypeScript

- 使用严格模式 (`strict: true`)
- 所有公共类型在 `types/` 目录定义
- 组件Props使用 `interface` 定义，格式: `{ComponentName}Props`
- 避免使用 `any`，特殊情况使用 `unknown` + 类型守卫

## React组件

- 函数式组件 + Hooks
- 文件使用 `PascalCase` 命名
- 默认导出组件
- 使用 `React.FC<Props>` 类型标注

## Zustand Store

- Store文件放在 `store/` 目录
- 命名格式: `{feature}Store.ts`
- 使用 `create<T>()` 泛型约束
- 状态和操作分离定义

## Ant Design 使用规范

- 优先使用Ant Design组件
- 自定义样式通过 `style` 或 `className` 覆盖
- 使用 `ConfigProvider` 进行全局主题定制
- 弹窗类组件使用 `Modal` 或 `Drawer`

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `TemplateList.tsx` |
| 工具文件 | camelCase | `promptStore.ts` |
| 类型文件 | camelCase | `prompt.ts` |
| 接口 | PascalCase | `PromptTemplate` |
| 变量/函数 | camelCase | `handleSubmit` |
| 常量 | UPPER_SNAKE | `DB_VERSION` |

## 目录结构