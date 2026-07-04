/**
 * 提示词管理系统的类型定义
 */

/** 提示词标签 */
export interface PromptTag {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

/** 全局变量 */
export interface PromptVariable {
  id: string;
  name: string;
  value: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

/** 提示词模板 */
export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  description?: string;
  tags: string[]; // 标签ID列表
  variables: string[]; // 变量名称列表，用于模板解析
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
}

/** 提示词历史记录 */
export interface PromptHistory {
  id: string;
  templateId?: string; // 关联的模板ID
  content: string; // 实际使用的提示词内容
  variables: Record<string, string>; // 使用的变量值
  result?: string; // 可选的执行结果
  tags: string[]; // 标签ID列表
  createdAt: number;
  duration?: number; // 执行耗时
}

/** 导出数据格式 */
export interface ExportData {
  version: string;
  exportedAt: number;
  templates: PromptTemplate[];
  variables: PromptVariable[];
  tags: PromptTag[];
  histories: PromptHistory[];
}

/** 导入选项 */
export interface ImportOptions {
  merge?: boolean; // 是否合并，false则覆盖
  onConflict?: (existing: any, incoming: any) => 'skip' | 'overwrite' | 'rename';
}