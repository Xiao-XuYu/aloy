/**
 * 提示词管理 Zustand Store
 * 整合所有提示词相关数据和操作
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PromptTemplate, PromptVariable, PromptTag, PromptHistory } from '../types/prompt';
import { db, StoreName } from '../db';

interface PromptState {
  // 数据
  templates: PromptTemplate[];
  variables: PromptVariable[];
  tags: PromptTag[];
  histories: PromptHistory[];
  
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  
  // UI状态
  selectedTemplateId: string | null;
  selectedTagIds: string[];
  searchKeyword: string;
  viewMode: 'grid' | 'list';
  historyFilter: { templateId?: string; tagId?: string };
}

interface PromptActions {
  // 初始化
  init: () => Promise<void>;
  
  // 模板操作
  addTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptTemplate>;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  deleteTemplates: (ids: string[]) => Promise<void>;
  getTemplate: (id: string) => PromptTemplate | undefined;
  toggleFavorite: (id: string) => Promise<void>;
  
  // 变量操作
  addVariable: (variable: Omit<PromptVariable, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PromptVariable>;
  updateVariable: (id: string, updates: Partial<PromptVariable>) => Promise<void>;
  deleteVariable: (id: string) => Promise<void>;
  getVariable: (id: string) => PromptVariable | undefined;
  getVariableByName: (name: string) => PromptVariable | undefined;
  
  // 标签操作
  addTag: (tag: Omit<PromptTag, 'id' | 'createdAt'>) => Promise<PromptTag>;
  updateTag: (id: string, updates: Partial<PromptTag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTag: (id: string) => PromptTag | undefined;
  
  // 历史操作
  addHistory: (history: Omit<PromptHistory, 'id' | 'createdAt'>) => Promise<PromptHistory>;
  deleteHistory: (id: string) => Promise<void>;
  clearHistories: () => Promise<void>;
  getHistories: (filter?: { templateId?: string; tagId?: string }) => PromptHistory[];
  
  // 导入导出
  exportData: () => Promise<{
    version: string;
    exportedAt: number;
    templates: PromptTemplate[];
    variables: PromptVariable[];
    tags: PromptTag[];
    histories: PromptHistory[];
  }>;
  importData: (data: any, clearFirst?: boolean) => Promise<void>;
  
  // 搜索与过滤
  searchTemplates: (keyword?: string) => PromptTemplate[];
  getTemplatesByTags: (tagIds: string[]) => PromptTemplate[];
  
  // UI状态操作
  setSelectedTemplate: (id: string | null) => void;
  setSelectedTags: (tagIds: string[]) => void;
  setSearchKeyword: (keyword: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setHistoryFilter: (filter: { templateId?: string; tagId?: string }) => void;
}

export type PromptStore = PromptState & PromptActions;

// 辅助函数：生成短ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      templates: [],
      variables: [],
      tags: [],
      histories: [],
      isLoading: false,
      isInitialized: false,
      selectedTemplateId: null,
      selectedTagIds: [],
      searchKeyword: '',
      viewMode: 'grid',
      historyFilter: {},

      // 初始化
      init: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        try {
          await db.init();
          const [templates, variables, tags, histories] = await Promise.all([
            db.getAll<PromptTemplate>(StoreName.TEMPLATES),
            db.getAll<PromptVariable>(StoreName.VARIABLES),
            db.getAll<PromptTag>(StoreName.TAGS),
            db.getAll<PromptHistory>(StoreName.HISTORIES),
          ]);
          
          set({
            templates,
            variables,
            tags,
            histories,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to initialize prompt store:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // 模板操作
      addTemplate: async (template) => {
        const now = Date.now();
        const newTemplate: PromptTemplate = {
          ...template,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        
        await db.put(StoreName.TEMPLATES, newTemplate);
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
        return newTemplate;
      },

      updateTemplate: async (id, updates) => {
        const state = get();
        const template = state.templates.find(t => t.id === id);
        if (!template) throw new Error(`Template ${id} not found`);
        
        const updated: PromptTemplate = {
          ...template,
          ...updates,
          updatedAt: Date.now(),
        };
        
        await db.put(StoreName.TEMPLATES, updated);
        set((state) => ({
          templates: state.templates.map(t => t.id === id ? updated : t),
        }));
      },

      deleteTemplate: async (id) => {
        await db.delete(StoreName.TEMPLATES, id);
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id),
        }));
      },

      deleteTemplates: async (ids) => {
        await db.deleteMany(StoreName.TEMPLATES, ids);
        set((state) => ({
          templates: state.templates.filter(t => !ids.includes(t.id)),
        }));
      },

      getTemplate: (id) => {
        return get().templates.find(t => t.id === id);
      },

      toggleFavorite: async (id) => {
        const state = get();
        const template = state.templates.find(t => t.id === id);
        if (!template) return;
        
        await state.updateTemplate(id, { favorite: !template.favorite });
      },

      // 变量操作
      addVariable: async (variable) => {
        const now = Date.now();
        const newVariable: PromptVariable = {
          ...variable,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        
        await db.put(StoreName.VARIABLES, newVariable);
        set((state) => ({
          variables: [...state.variables, newVariable],
        }));
        return newVariable;
      },

      updateVariable: async (id, updates) => {
        const state = get();
        const variable = state.variables.find(v => v.id === id);
        if (!variable) throw new Error(`Variable ${id} not found`);
        
        const updated: PromptVariable = {
          ...variable,
          ...updates,
          updatedAt: Date.now(),
        };
        
        await db.put(StoreName.VARIABLES, updated);
        set((state) => ({
          variables: state.variables.map(v => v.id === id ? updated : v),
        }));
      },

      deleteVariable: async (id) => {
        await db.delete(StoreName.VARIABLES, id);
        set((state) => ({
          variables: state.variables.filter(v => v.id !== id),
        }));
      },

      getVariable: (id) => {
        return get().variables.find(v => v.id === id);
      },

      getVariableByName: (name) => {
        return get().variables.find(v => v.name === name);
      },

      // 标签操作
      addTag: async (tag) => {
        const newTag: PromptTag = {
          ...tag,
          id: generateId(),
          createdAt: Date.now(),
        };
        
        await db.put(StoreName.TAGS, newTag);
        set((state) => ({
          tags: [...state.tags, newTag],
        }));
        return newTag;
      },

      updateTag: async (id, updates) => {
        const state = get();
        const tag = state.tags.find(t => t.id === id);
        if (!tag) throw new Error(`Tag ${id} not found`);
        
        const updated: PromptTag = { ...tag, ...updates };
        await db.put(StoreName.TAGS, updated);
        set((state) => ({
          tags: state.tags.map(t => t.id === id ? updated : t),
        }));
      },

      deleteTag: async (id) => {
        await db.delete(StoreName.TAGS, id);
        set((state) => ({
          tags: state.tags.filter(t => t.id !== id),
          // 同时从模板中移除该标签
          templates: state.templates.map(t => ({
            ...t,
            tags: t.tags.filter(tagId => tagId !== id),
          })),
        }));
      },

      getTag: (id) => {
        return get().tags.find(t => t.id === id);
      },

      // 历史操作
      addHistory: async (history) => {
        const newHistory: PromptHistory = {
          ...history,
          id: generateId(),
          createdAt: Date.now(),
        };
        
        await db.put(StoreName.HISTORIES, newHistory);
        set((state) => ({
          histories: [newHistory, ...state.histories],
        }));
        return newHistory;
      },

      deleteHistory: async (id) => {
        await db.delete(StoreName.HISTORIES, id);
        set((state) => ({
          histories: state.histories.filter(h => h.id !== id),
        }));
      },

      clearHistories: async () => {
        await db.clearAll();
        set({ histories: [] });
      },

      getHistories: (filter) => {
        const state = get();
        let result = state.histories;
        if (filter?.templateId) {
          result = result.filter(h => h.templateId === filter.templateId);
        }
        if (filter?.tagId) {
          result = result.filter(h => h.tags.includes(filter.tagId));
        }
        return result;
      },

      // 导入导出
      exportData: async () => {
        const state = get();
        return {
          version: '1.0.0',
          exportedAt: Date.now(),
          templates: state.templates,
          variables: state.variables,
          tags: state.tags,
          histories: state.histories,
        };
      },

      importData: async (data, clearFirst = true) => {
        await db.importAll(data, clearFirst);
        set({
          templates: data.templates || [],
          variables: data.variables || [],
          tags: data.tags || [],
          histories: data.histories || [],
        });
      },

      // 搜索与过滤
      searchTemplates: (keyword) => {
        const state = get();
        const search = (keyword || state.searchKeyword || '').toLowerCase().trim();
        if (!search) return state.templates;
        
        return state.templates.filter(t => 
          t.name.toLowerCase().includes(search) ||
          t.content.toLowerCase().includes(search) ||
          (t.description && t.description.toLowerCase().includes(search))
        );
      },

      getTemplatesByTags: (tagIds) => {
        const state = get();
        if (!tagIds.length) return state.templates;
        return state.templates.filter(t => 
          tagIds.some(tagId => t.tags.includes(tagId))
        );
      },

      // UI状态操作
      setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
      setSelectedTags: (tagIds) => set({ selectedTagIds: tagIds }),
      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setHistoryFilter: (filter) => set({ historyFilter: filter }),
    }),
    {
      name: 'prompt-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        searchKeyword: state.searchKeyword,
        selectedTagIds: state.selectedTagIds,
      }),
    }
  )
);