import React, { useState, useEffect } from 'react';
import { ConfigProvider, Button, Space, message, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Layout } from './components/Layout';
import { TemplateList } from './components/TemplateList';
import { TemplateEditor } from './components/TemplateEditor';
import { TemplateExecutor } from './components/TemplateExecutor';
import { VariableManager } from './components/VariableManager';
import { HistoryList } from './components/HistoryList';
import { TagManager } from './components/TagManager';
import { ImportExport } from './components/ImportExport';
import { usePromptStore } from './store/promptStore';
import type { PromptTemplate } from './types/prompt';
import './index.css';

type PageType = 'templates' | 'variables' | 'history' | 'tags';

const AppContent: React.FC = () => {
  const { init, isInitialized } = usePromptStore();
  const [currentPage, setCurrentPage] = useState<PageType>('templates');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [showExecutor, setShowExecutor] = useState(false);
  const [executingTemplate, setExecutingTemplate] = useState<PromptTemplate | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      init().catch(console.error);
    }
  }, [init, isInitialized]);

  const handleNewTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleUseTemplate = (template: PromptTemplate) => {
    setExecutingTemplate(template);
    setShowExecutor(true);
  };

  const handleExecuteComplete = (content: string, variables: Record<string, string>) => {
    console.log('执行完成:', { content, variables });
    setShowExecutor(false);
    setExecutingTemplate(null);
  };

  const handleEditorSave = () => {
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    setShowEditor(false);
    setShowExecutor(false);
    setShowImportExport(false);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {/* 顶部操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          {currentPage === 'templates' && (
            <Button type="primary" onClick={handleNewTemplate}>
              + 新建提示词
            </Button>
          )}
          <Button onClick={() => setShowImportExport(!showImportExport)}>
            📦 导入/导出
          </Button>
        </Space>
        <Space>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            {isInitialized ? '✅ 数据库已连接' : '⏳ 加载中...'}
          </span>
        </Space>
      </div>

      {/* 导入导出面板 */}
      {showImportExport && (
        <div style={{ marginBottom: 16 }}>
          <ImportExport onClose={() => setShowImportExport(false)} />
        </div>
      )}

      {/* 页面内容 */}
      {currentPage === 'templates' && (
        <TemplateList
          onEdit={handleEditTemplate}
          onSelect={handleUseTemplate}
        />
      )}

      {currentPage === 'variables' && <VariableManager />}
      {currentPage === 'history' && <HistoryList />}
      {currentPage === 'tags' && <TagManager />}

      {/* 编辑器弹窗 */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          onSave={handleEditorSave}
        />
      )}

      {/* 执行器弹窗 */}
      {showExecutor && executingTemplate && (
        <TemplateExecutor
          template={executingTemplate}
          onClose={() => {
            setShowExecutor(false);
            setExecutingTemplate(null);
          }}
          onExecute={handleExecuteComplete}
        />
      )}
    </Layout>
  );
};

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
          },
        },
      }}
    >
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;