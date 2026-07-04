import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  message,
  Upload,
  Modal,
  Radio,
  Alert,
  Divider,
  Tag,
  Row,
  Col,
  Spin,
} from 'antd';
import {
  DownloadOutlined,
  UploadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { ExportData } from '../types/prompt';
import type { RcFile } from 'antd/es/upload/interface';

const { Text, Title, Paragraph } = Typography;

interface ImportExportProps {
  onClose?: () => void;
}

export const ImportExport: React.FC<ImportExportProps> = ({ onClose }) => {
  const { templates, variables, tags, histories, exportData, importData } = usePromptStore();
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('merge');
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleExportAll = async () => {
    try {
      setLoading(true);
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prompts_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success('导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelected = async () => {
    // 简化版：导出所有模板（可选择）
    const selectedIds = templates.map(t => t.id);
    if (selectedIds.length === 0) {
      message.warning('没有可导出的模板');
      return;
    }

    try {
      setLoading(true);
      const allData = await exportData();
      const selectedTemplates = allData.templates.filter(t => selectedIds.includes(t.id));

      // 导出关联的标签和变量
      const relatedTagIds = new Set(selectedTemplates.flatMap(t => t.tags));
      const relatedTags = allData.tags.filter(t => relatedTagIds.has(t.id));
      const relatedVarNames = new Set(selectedTemplates.flatMap(t => t.variables));
      const relatedVariables = allData.variables.filter(v => relatedVarNames.has(v.name));

      const exportDataObj: ExportData = {
        version: allData.version,
        exportedAt: Date.now(),
        templates: selectedTemplates,
        variables: relatedVariables,
        tags: relatedTags,
        histories: [],
      };

      const json = JSON.stringify(exportDataObj, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `selected_prompts_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success(`成功导出 ${selectedTemplates.length} 个模板`);
    } catch (error) {
      console.error('导出选中模板失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file: RcFile) => {
    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      // 验证数据格式
      if (!data.version || !data.templates || !data.variables || !data.tags || !data.histories) {
        throw new Error('无效的数据格式：缺少必需字段');
      }

      // 显示预览
      setPreviewData(data);
      setPreviewVisible(true);
      return false; // 阻止自动上传
    } catch (error) {
      console.error('解析文件失败:', error);
      message.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setLoading(false);
      return false;
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;

    try {
      const clearFirst = importMode === 'overwrite';
      await importData(previewData, clearFirst);

      const templateCount = previewData.templates?.length || 0;
      const variableCount = previewData.variables?.length || 0;
      const tagCount = previewData.tags?.length || 0;
      const historyCount = previewData.histories?.length || 0;

      message.success(
        `导入成功！${clearFirst ? '覆盖' : '合并'}了 ${templateCount} 个模板、${variableCount} 个变量、${tagCount} 个标签、${historyCount} 条历史记录`
      );
      setPreviewVisible(false);
      setPreviewData(null);
    } catch (error) {
      console.error('导入失败:', error);
      message.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelImport = () => {
    setPreviewVisible(false);
    setPreviewData(null);
    setLoading(false);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Title level={4} style={{ margin: 0 }}>📦 数据导入 / 导出</Title>
        <Text type="secondary">备份、恢复或迁移您的提示词数据</Text>

        <Divider />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title="📤 导出数据"
              extra={<Tag color="blue">备份</Tag>}
              bordered
              style={{ height: '100%' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Paragraph type="secondary">
                  导出所有数据包括模板、变量、标签和历史记录
                </Paragraph>
                <Space>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={loading}
                    onClick={handleExportAll}
                  >
                    导出全部数据
                  </Button>
                  <Button
                    icon={<FileOutlined />}
                    loading={loading}
                    onClick={handleExportSelected}
                  >
                    导出所有模板 ({templates.length})
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="📥 导入数据"
              extra={<Tag color="green">恢复</Tag>}
              bordered
              style={{ height: '100%' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Paragraph type="secondary">
                  从JSON文件导入数据，支持覆盖或合并模式
                </Paragraph>
                <Upload
                  accept=".json"
                  beforeUpload={handleImport}
                  fileList={[]}
                  showUploadList={false}
                >
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    loading={loading}
                  >
                    选择文件导入
                  </Button>
                </Upload>
                <div style={{ marginTop: 8 }}>
                  <Radio.Group
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="merge">合并模式</Radio.Button>
                    <Radio.Button value="overwrite">覆盖模式</Radio.Button>
                  </Radio.Group>
                  <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                    {importMode === 'merge'
                      ? '保留现有数据，新增不重复的数据'
                      : '清空所有现有数据，用导入的数据替换'}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              📊 当前数据: {templates.length} 个模板 | {variables.length} 个变量 | {tags.length} 个标签 | {histories.length} 条历史
            </Text>
          </div>
          {onClose && (
            <Button onClick={onClose}>关闭</Button>
          )}
        </div>
      </div>

      {/* 导入预览确认弹窗 */}
      <Modal
        title="📋 导入数据预览"
        open={previewVisible}
        onOk={handleConfirmImport}
        onCancel={handleCancelImport}
        okText="确认导入"
        cancelText="取消"
        width={600}
        confirmLoading={loading}
      >
        {previewData && (
          <div>
            <Alert
              message={
                importMode === 'overwrite'
                  ? '⚠️ 覆盖模式：所有现有数据将被清空'
                  : 'ℹ️ 合并模式：新增不重复的数据'
              }
              type={importMode === 'overwrite' ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Card size="small">
                <Text strong>📝 模板</Text>
                <div style={{ fontSize: 24, color: '#1890ff' }}>
                  {previewData.templates?.length || 0}
                </div>
              </Card>
              <Card size="small">
                <Text strong>🔧 变量</Text>
                <div style={{ fontSize: 24, color: '#52c41a' }}>
                  {previewData.variables?.length || 0}
                </div>
              </Card>
              <Card size="small">
                <Text strong>🏷️ 标签</Text>
                <div style={{ fontSize: 24, color: '#faad14' }}>
                  {previewData.tags?.length || 0}
                </div>
              </Card>
              <Card size="small">
                <Text strong>📜 历史</Text>
                <div style={{ fontSize: 24, color: '#722ed1' }}>
                  {previewData.histories?.length || 0}
                </div>
              </Card>
            </div>
            <div style={{ marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                导出版本: {previewData.version} | 导出时间: {new Date(previewData.exportedAt).toLocaleString()}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};