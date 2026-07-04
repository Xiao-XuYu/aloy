import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Space,
  Tag,
  Typography,
  Popconfirm,
  message,
  Empty,
  ColorPicker,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { PromptTag } from '../types/prompt';

const { Text } = Typography;

// 预设颜色
const PRESET_COLORS = [
  '#FF6B6B', '#FF8A5C', '#FFEAA7', '#96CEB4', '#4ECDC4',
  '#45B7D1', '#A29BFE', '#DDA0DD', '#FD79A8', '#00CEC9',
  '#6C5CE7', '#FDCB6E', '#E17055', '#00B894', '#0984E3',
];

export const TagManager: React.FC = () => {
  const { tags, addTag, updateTag, deleteTag } = usePromptStore();
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    // 设置默认颜色
    form.setFieldsValue({ color: '#4ECDC4' });
  };

  const handleEdit = (record: PromptTag) => {
    form.setFieldsValue({
      name: record.name,
      color: record.color || '#4ECDC4',
    });
    setEditingId(record.id);
  };

  const handleDelete = async (id: string) => {
    const { templates } = usePromptStore.getState();
    const usedCount = templates.filter(t => t.tags.includes(id)).length;

    if (usedCount > 0) {
      const confirm = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '标签正在使用中',
          content: (
            <div>
              <Text>此标签被 <Text strong>{usedCount}</Text> 个模板使用，删除后这些模板将失去此标签。</Text>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                确定要删除吗？
              </Text>
            </div>
          ),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirm) return;
    }

    await deleteTag(id);
    message.success('标签已删除');
    if (editingId === id) {
      form.resetFields();
      setEditingId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 检查重复名称
      const exists = tags.some(t =>
        t.name === values.name.trim() && t.id !== editingId
      );
      if (exists) {
        message.error('标签名称已存在，请使用不同的名称');
        setLoading(false);
        return;
      }

      if (editingId) {
        await updateTag(editingId, {
          name: values.name.trim(),
          color: values.color || '#4ECDC4',
        });
        message.success('标签已更新');
      } else {
        await addTag({
          name: values.name.trim(),
          color: values.color || '#4ECDC4',
        });
        message.success('标签已创建');
      }

      setLoading(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('保存标签失败:', error);
      setLoading(false);
      message.error('保存失败，请重试');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingId(null);
  };

  const columns = [
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <span
          style={{
            display: 'inline-block',
            width: 24,
            height: 24,
            borderRadius: 4,
            backgroundColor: color || '#4ECDC4',
            border: '1px solid #d9d9d9',
          }}
        />
      ),
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: PromptTag) => (
        <Tag color={record.color || '#4ECDC4'} style={{ fontSize: 14, padding: '4px 12px' }}>
          {name}
        </Tag>
      ),
    },
    {
      title: '使用次数',
      key: 'usage',
      render: (_: any, record: PromptTag) => {
        const count = usePromptStore.getState().templates.filter(t => t.tags.includes(record.id)).length;
        return <Text type="secondary">{count} 个模板</Text>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: number) => new Date(time).toLocaleString('zh-CN'),
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: PromptTag) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此标签？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 新建/编辑表单 */}
      <Card size="small">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Text strong>
            {editingId ? '✏️ 编辑标签' : '🏷️ 新建标签'}
          </Text>
          <Form form={form} layout="inline" style={{ flex: 1 }}>
            <Form.Item
              name="name"
              rules={[{ required: true, message: '请输入标签名称' }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="标签名称" style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="color"
              style={{ marginBottom: 0 }}
            >
              <ColorPicker
                showText
                presets={[
                  {
                    label: '预设颜色',
                    colors: PRESET_COLORS,
                  },
                ]}
              />
            </Form.Item>
          </Form>
          <Space>
            <Button
              type="primary"
              icon={editingId ? <SaveOutlined /> : <PlusOutlined />}
              loading={loading}
              onClick={handleSubmit}
            >
              {editingId ? '更新' : '添加'}
            </Button>
            {editingId && (
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                取消
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* 颜色预设快速选择 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {PRESET_COLORS.map(c => (
          <div
            key={c}
            onClick={() => form.setFieldsValue({ color: c })}
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              backgroundColor: c,
              cursor: 'pointer',
              border: form.getFieldValue('color') === c ? '3px solid #1890ff' : '1px solid #d9d9d9',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* 标签列表 */}
      <Table
        dataSource={tags}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无标签"
            />
          ),
        }}
        bordered
      />
    </div>
  );
};