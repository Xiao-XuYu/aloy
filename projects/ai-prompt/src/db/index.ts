/**
 * IndexDB 数据库操作层
 * 使用原生IndexDB API进行数据持久化
 */

import type { PromptTemplate, PromptVariable, PromptTag, PromptHistory } from '../types/prompt';

const DB_NAME = 'PromptManagerDB';
const DB_VERSION = 1;

export enum StoreName {
  TEMPLATES = 'templates',
  VARIABLES = 'variables',
  TAGS = 'tags',
  HISTORIES = 'histories',
}

class PromptDatabase {
  private db: IDBDatabase | null = null;

  /** 初始化数据库 */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(StoreName.TEMPLATES)) {
          const store = db.createObjectStore(StoreName.TEMPLATES, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('favorite', 'favorite');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }

        if (!db.objectStoreNames.contains(StoreName.VARIABLES)) {
          const store = db.createObjectStore(StoreName.VARIABLES, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('updatedAt', 'updatedAt');
          store.createIndex('name', 'name');
        }

        if (!db.objectStoreNames.contains(StoreName.TAGS)) {
          const store = db.createObjectStore(StoreName.TAGS, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('name', 'name');
        }

        if (!db.objectStoreNames.contains(StoreName.HISTORIES)) {
          const store = db.createObjectStore(StoreName.HISTORIES, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('templateId', 'templateId');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
    });
  }

  /** 确保数据库已初始化 */
  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /** 通用添加/更新方法 */
  async put<T extends { id: string }>(storeName: StoreName, data: T): Promise<T> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => {
        resolve(data);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /** 通用获取所有数据 */
  async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /** 通用根据ID获取数据 */
  async get<T>(storeName: StoreName, id: string): Promise<T | null> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /** 通用删除数据 */
  async delete(storeName: StoreName, id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /** 通用批量删除 */
  async deleteMany(storeName: StoreName, ids: string[]): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      ids.forEach(id => {
        store.delete(id);
      });

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /** 根据索引查询数据 */
  async getByIndex<T>(storeName: StoreName, indexName: string, value: any): Promise<T[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /** 清空所有数据 */
  async clearAll(): Promise<void> {
    const db = this.ensureDB();
    const stores = [StoreName.TEMPLATES, StoreName.VARIABLES, StoreName.TAGS, StoreName.HISTORIES];
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(stores, 'readwrite');
      
      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        store.clear();
      });

      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /** 导出所有数据 */
  async exportAll(): Promise<{
    templates: PromptTemplate[];
    variables: PromptVariable[];
    tags: PromptTag[];
    histories: PromptHistory[];
  }> {
    const [templates, variables, tags, histories] = await Promise.all([
      this.getAll<PromptTemplate>(StoreName.TEMPLATES),
      this.getAll<PromptVariable>(StoreName.VARIABLES),
      this.getAll<PromptTag>(StoreName.TAGS),
      this.getAll<PromptHistory>(StoreName.HISTORIES),
    ]);

    return { templates, variables, tags, histories };
  }

  /** 导入数据 */
  async importAll(data: {
    templates: PromptTemplate[];
    variables: PromptVariable[];
    tags: PromptTag[];
    histories: PromptHistory[];
  }, clearFirst: boolean = true): Promise<void> {
    if (clearFirst) {
      await this.clearAll();
    }

    const db = this.ensureDB();
    const stores = [
      { name: StoreName.TEMPLATES, items: data.templates },
      { name: StoreName.VARIABLES, items: data.variables },
      { name: StoreName.TAGS, items: data.tags },
      { name: StoreName.HISTORIES, items: data.histories },
    ];

    for (const { name, items } of stores) {
      if (items.length === 0) continue;
      
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(name, 'readwrite');
        const store = transaction.objectStore(name);
        
        items.forEach(item => {
          store.put(item);
        });

        transaction.oncomplete = () => {
          resolve(null);
        };
        transaction.onerror = () => {
          reject(transaction.error);
        };
      });
    }
  }
}

// 单例导出
export const db = new PromptDatabase();