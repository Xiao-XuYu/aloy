import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Form,
  Modal,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm,
  Empty,
  Card,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { PromptVariable } from '../types/prompt';

const { Text } = Typography;

export const VariableManager: React.FC = () => {
  const { variables, addVariable, updateVariable, deleteVariable } = usePromptStore();
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record: PromptVariable) => {
    form.setFieldsValue({
      name: record.name,
      value: record.value,
      description: record.description,
    });
    setEditingId(record.id);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteVariable(id);
    message.success('变量已删除');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 检查重复名称
      const exists = variables.some(v =>
        v.name === values.name.trim() && v.id !== editingId
      );
      if (exists) {
        message.error('变量名称已存在，请使用不同的名称');
        setLoading(false);
        return;
      }

      if (editingId) {
        await updateVariable(editingId, {
          name: values.name.trim(),
          value: values.value || '',
          description: values.description || '',
        });
        message.success('变量已更新');
      } else {
        await addVariable({
          name: values.name.trim(),
          value: values.value || '',
          description: values.description || '',
        });
        message.success('变量已创建');
      }

      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      console.error('保存变量失败:', error);
      setLoading(false);
      message.error('保存失败，请重试');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text code>{name}</Text>,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => (
        <Tag color="blue" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value || '(空)'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || <Text type="secondary">-</Text>,
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
      render: (_: any, record: PromptVariable) => (
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
            title="确定删除此变量？"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary">共 {variables.length} 个全局变量</Text>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建变量
        </Button>
      </div>

      <Table
        dataSource={variables}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无全局变量"
            />
          ),
        }}
        bordered
      />

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingId ? '✏️ 编辑变量' : '➕ 新建变量'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="变量名称"
            rules={[
              { required: true, message: '请输入变量名称' },
              { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '变量名只能包含字母、数字和下划线，且必须以字母或下划线开头' },
            ]}
            extra="变量名只能包含字母、数字和下划线"
          >
            <Input placeholder="如: apiKey, userName" />
          </Form.Item>

          <Form.Item
            name="value"
            label="变量值"
          >
            <Input placeholder="输入变量值" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={2} placeholder="可选描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};