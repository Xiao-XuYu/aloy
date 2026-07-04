import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Space,
  Tag,
  Typography,
  message,
  Divider,
  Descriptions,
} from 'antd';
import { PlayCircleOutlined, ClearOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { PromptTemplate } from '../types/prompt';

const { Text, Paragraph } = Typography;

interface TemplateExecutorProps {
  template: PromptTemplate | null;
  onClose: () => void;
  onExecute: (content: string, variables: Record<string, string>) => void;
}

export const TemplateExecutor: React.FC<TemplateExecutorProps> = ({ template, onClose, onExecute }) => {
  const { variables, addHistory, tags } = usePromptStore();
  const [form] = Form.useForm();
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!template) return;

    // 初始化变量值
    const initialValues: Record<string, string> = {};
    template.variables.forEach(v => {
      const globalVar = variables.find(vv => vv.name === v);
      initialValues[v] = globalVar?.value || '';
    });
    form.setFieldsValue(initialValues);
    updatePreview(initialValues);
  }, [template, variables, form]);

  const updatePreview = (values: Record<string, string>) => {
    if (!template) return;
    let result = template.content;
    Object.entries(values).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
    });
    setPreview(result);
  };

  const handleValuesChange = (_: any, allValues: Record<string, string>) => {
    updatePreview(allValues);
  };

  const handleExecute = async () => {
    if (!template) return;

    try {
      const values = await form.validateFields();
      setLoading(true);

      // 检查未填写的变量
      const missingVars = template.variables.filter(v => !values[v]?.trim());
      if (missingVars.length > 0) {
        const confirm = await new Promise<boolean>((resolve) => {
          Modal.confirm({
            title: '变量未填写',
            content: (
              <div>
                <Text>以下变量未填写：</Text>
                <div style={{ marginTop: 8 }}>
                  {missingVars.map(v => (
                    <Tag key={v} color="warning">{v}</Tag>
                  ))}
                </div>
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  是否继续执行？
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

      // 记录历史
      await addHistory({
        templateId: template.id,
        content: preview,
        variables: values,
        tags: template.tags,
      });

      message.success('执行成功，已保存历史记录');
      onExecute(preview, values);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('执行失败:', error);
      setLoading(false);
      message.error('执行失败，请检查变量填写');
    }
  };

  const handleFillFromGlobals = () => {
    if (!template) return;
    const currentValues = form.getFieldsValue();
    const newValues = { ...currentValues };
    template.variables.forEach(v => {
      const globalVar = variables.find(vv => vv.name === v);
      if (globalVar?.value && !newValues[v]) {
        newValues[v] = globalVar.value;
      }
    });
    form.setFieldsValue(newValues);
    updatePreview(newValues);
    message.success('已从全局变量填充');
  };

  const handleClearAll = () => {
    if (!template) return;
    const emptyValues: Record<string, string> = {};
    template.variables.forEach(v => {
      emptyValues[v] = '';
    });
    form.setFieldsValue(emptyValues);
    updatePreview(emptyValues);
  };

  if (!template) {
    return (
      <Modal
        title="使用提示词"
        open={true}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
      >
        <Alert message="请选择一个提示词模板" type="info" showIcon />
      </Modal>
    );
  }

  const getTagNames = (tagIds: string[]) => {
    return tagIds.map(id => tags.find(t => t.id === id)?.name || id).filter(Boolean);
  };

  return (
    <Modal
      title={
        <div>
          <Text strong>▶ 使用提示词</Text>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
            {template.name}
          </Text>
        </div>
      }
      open={true}
      onCancel={onClose}
      width={800}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleFillFromGlobals}>
              从全局变量填充
            </Button>
            <Button icon={<ClearOutlined />} onClick={handleClearAll}>
              清空所有
            </Button>
          </Space>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={loading}
              onClick={handleExecute}
            >
              执行并保存历史
            </Button>
          </Space>
        </div>
      }
      style={{ top: 20 }}
    >
      {/* 模板信息 */}
      <div style={{ marginBottom: 16 }}>
        {template.description && (
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
            {template.description}
          </Text>
        )}
        <Space size={4} wrap>
          {getTagNames(template.tags).map((name, i) => (
            <Tag key={i}>{name}</Tag>
          ))}
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 变量填充区 */}
      {template.variables.length > 0 ? (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <Alert
            message={`${template.variables.length} 个变量需要填充`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          {template.variables.map(v => {
            const globalVar = variables.find(vv => vv.name === v);
            return (
              <Form.Item
                key={v}
                name={v}
                label={
                  <Space>
                    <Text strong>{v}</Text>
                    {globalVar && (
                      <Tag color="green" style={{ fontSize: 11 }}>
                        全局: {globalVar.value || '空'}
                      </Tag>
                    )}
                  </Space>
                }
                rules={[{ required: true, message: `请输入 ${v} 的值` }]}
              >
                <Input
                  placeholder={`输入 ${v} 的值...`}
                  prefix="📌"
                />
              </Form.Item>
            );
          })}
        </Form>
      ) : (
        <Alert message="此模板没有变量，可直接执行" type="success" showIcon />
      )}

      <Divider style={{ margin: '12px 0' }}>
        <Text type="secondary">📄 生成预览</Text>
      </Divider>

      <Paragraph
        style={{
          background: '#f5f7fa',
          padding: 12,
          borderRadius: 8,
          fontFamily: 'monospace',
          fontSize: 13,
          whiteSpace: 'pre-wrap',
          maxHeight: 200,
          overflow: 'auto',
          marginBottom: 0,
        }}
      >
        {preview || '预览将在此显示...'}
      </Paragraph>
    </Modal>
  );
};