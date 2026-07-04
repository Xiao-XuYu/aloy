import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Alert,
  message,
  Typography,
  Divider,
} from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { PromptTemplate, PromptTag } from '../types/prompt';

const { TextArea } = Input;
const { Text } = Typography;

interface TemplateEditorProps {
  template?: PromptTemplate | null;
  onClose: () => void;
  onSave: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onClose, onSave }) => {
  const { addTemplate, updateTemplate, tags, variables, addTag } = usePromptStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const isEdit = !!template;

  // 检测模板中的变量 {{variableName}}
  const detectVariables = (content: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = [...content.matchAll(regex)];
    const vars = matches.map(m => m[1].trim()).filter(Boolean);
    return [...new Set(vars)];
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    const vars = detectVariables(content);
    setDetectedVariables(vars);
    form.setFieldsValue({ variables: vars });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 验证变量是否存在
      const missingVars = detectedVariables.filter(
        v => !variables.some(vv => vv.name === v)
      );
      if (missingVars.length > 0) {
        const confirm = await new Promise<boolean>((resolve) => {
          Modal.confirm({
            title: '变量未定义',
            content: (
              <div>
                <Text>检测到以下变量未在全局变量中定义：</Text>
                <div style={{ marginTop: 8 }}>
                  {missingVars.map(v => (
                    <Tag key={v} color="warning">{v}</Tag>
                  ))}
                </div>
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  是否继续保存？
                </Text>
              </div>
            ),
            onOk: () => resolve(true),
            onCancel: () => resolve(false),
          });
        });
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      const data = {
        name: values.name.trim(),
        content: values.content.trim(),
        description: values.description?.trim() || undefined,
        tags: values.tags || [],
        variables: detectedVariables,
        favorite: template?.favorite || false,
      };

      if (isEdit) {
        await updateTemplate(template.id, data);
        message.success('模板已更新');
      } else {
        await addTemplate(data);
        message.success('模板已创建');
      }

      setLoading(false);
      onSave();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      setLoading(false);
      message.error('保存失败，请重试');
    }
  };

  const handleAddNewTag = async () => {
    if (!newTagInput.trim()) return;
    setIsCreatingTag(true);
    try {
      const existing = tags.find(t => t.name === newTagInput.trim());
      if (existing) {
        const currentTags = form.getFieldValue('tags') || [];
        if (!currentTags.includes(existing.id)) {
          form.setFieldValue('tags', [...currentTags, existing.id]);
        }
        setNewTagInput('');
        setIsCreatingTag(false);
        return;
      }
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE'];
      const newTag = await addTag({
        name: newTagInput.trim(),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      const currentTags = form.getFieldValue('tags') || [];
      form.setFieldValue('tags', [...currentTags, newTag.id]);
      setNewTagInput('');
      message.success('标签已创建');
    } catch (error) {
      console.error('创建标签失败:', error);
      message.error('创建标签失败');
    } finally {
      setIsCreatingTag(false);
    }
  };

  useEffect(() => {
    if (template) {
      form.setFieldsValue({
        name: template.name,
        content: template.content,
        description: template.description,
        tags: template.tags,
        variables: template.variables,
      });
      setDetectedVariables(template.variables || []);
    } else {
      form.resetFields();
      setDetectedVariables([]);
    }
  }, [template, form]);

  return (
    <Modal
      title={isEdit ? '✏️ 编辑提示词' : '📝 新建提示词'}
      open={true}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
      okText="保存"
      cancelText="取消"
      style={{ top: 20 }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ tags: [], variables: [] }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入模板名称' }]}
        >
          <Input placeholder="输入模板名称..." />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input placeholder="简短描述这个模板..." />
        </Form.Item>

        <Form.Item
          name="content"
          label="内容"
          rules={[{ required: true, message: '请输入模板内容' }]}
        >
          <TextArea
            rows={8}
            placeholder="输入提示词内容... 使用 {{variableName}} 定义变量"
            onChange={handleContentChange}
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label="标签"
        >
          <Select
            mode="multiple"
            placeholder="选择或创建标签"
            allowClear
            dropdownRender={(menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ padding: '0 8px 4px', display: 'flex', gap: 8 }}>
                  <Input
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="输入新标签名称"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    loading={isCreatingTag}
                    onClick={handleAddNewTag}
                  >
                    添加
                  </Button>
                </div>
              </div>
            )}
          >
            {tags.map(tag => (
              <Select.Option key={tag.id} value={tag.id}>
                <Space>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: tag.color || '#ccc',
                    }}
                  />
                  {tag.name}
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 检测到的变量 */}
        {detectedVariables.length > 0 && (
          <Alert
            message={
              <div>
                <Text strong>📌 检测到变量 ({detectedVariables.length})</Text>
                <div style={{ marginTop: 4 }}>
                  {detectedVariables.map(v => {
                    const exists = variables.some(vv => vv.name === v);
                    return (
                      <Tag key={v} color={exists ? 'success' : 'warning'}>
                        {v} {exists ? '✅' : '⚠️ 未定义'}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            }
            type={detectedVariables.every(v => variables.some(vv => vv.name === v)) ? 'success' : 'warning'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          name="variables"
          label="变量列表（自动检测）"
          hidden
        >
          <Input />
        </Form.Item>

        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 使用 {'{{variableName}}'} 格式定义变量，变量值将从全局变量中获取
          </Text>
        </div>
      </Form>
    </Modal>
  );
};