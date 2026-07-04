import React, { useState } from 'react';
import {
  Table,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Popconfirm,
  Modal,
  message,
  Empty,
  Drawer,
  Descriptions,
  Badge,
} from 'antd';
import {
  DeleteOutlined,
  ClearOutlined,
  EyeOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { PromptHistory } from '../types/prompt';

const { Text } = Typography;

export const HistoryList: React.FC = () => {
  const { histories, templates, tags, deleteHistory, clearHistories, getHistories } = usePromptStore();
  const [filterTemplateId, setFilterTemplateId] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<PromptHistory | null>(null);

  const filteredHistories = filterTemplateId
    ? getHistories({ templateId: filterTemplateId })
    : histories;

  const getTemplateName = (templateId?: string) => {
    if (!templateId) return '独立使用';
    return templates.find(t => t.id === templateId)?.name || '已删除模板';
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds.map(id => tags.find(t => t.id === id)?.name || id).filter(Boolean);
  };

  const handleDelete = async (id: string) => {
    await deleteHistory(id);
    message.success('已删除');
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    for (const id of selectedRowKeys) {
      await deleteHistory(id);
    }
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 条记录`);
  };

  const handleClearAll = async () => {
    await clearHistories();
    message.success('已清空所有历史记录');
  };

  const handleViewDetail = (record: PromptHistory) => {
    setSelectedHistory(record);
    setDetailVisible(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const columns = [
    {
      title: '模板',
      dataIndex: 'templateId',
      key: 'templateId',
      render: (id: string | undefined) => (
        <Badge
          color={id ? 'blue' : 'default'}
          text={getTemplateName(id)}
        />
      ),
      width: 160,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tagIds: string[]) => (
        <Space size={4} wrap>
          {getTagNames(tagIds).map((name, i) => (
            <Tag key={i} color="default" style={{ margin: 0 }}>
              {name}
            </Tag>
          ))}
          {tagIds.length === 0 && <Text type="secondary">无</Text>}
        </Space>
      ),
    },
    {
      title: '变量',
      dataIndex: 'variables',
      key: 'variables',
      render: (vars: Record<string, string>) => {
        const entries = Object.entries(vars || {});
        if (entries.length === 0) return <Text type="secondary">无</Text>;
        return (
          <Space size={4} wrap>
            {entries.slice(0, 3).map(([k, v]) => (
              <Tag key={k} color="cyan" style={{ margin: 0 }}>
                {k}={v || '(空)'}
              </Tag>
            ))}
            {entries.length > 3 && <Tag>+{entries.length - 3}</Tag>}
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: number) => formatDate(time),
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: PromptHistory) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定删除此记录？"
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

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <Select
          value={filterTemplateId}
          onChange={setFilterTemplateId}
          placeholder="筛选模板"
          allowClear
          style={{ width: 200 }}
          options={[
            { value: '', label: '全部模板' },
            ...templates.map(t => ({ value: t.id, label: t.name })),
          ]}
          prefix={<FilterOutlined />}
        />
        <div style={{ flex: 1 }} />
        {selectedRowKeys.length > 0 && (
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 条记录？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
        {histories.length > 0 && (
          <Popconfirm
            title="确定清空所有历史记录？此操作不可恢复！"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<ClearOutlined />}>
              清空全部
            </Button>
          </Popconfirm>
        )}
      </div>

      {/* 统计信息 */}
      <Text type="secondary" style={{ fontSize: 13 }}>
        共 {filteredHistories.length} 条历史记录
        {filterTemplateId && ` (筛选于: ${getTemplateName(filterTemplateId)})`}
      </Text>

      {/* 历史列表 */}
      <Table
        dataSource={filteredHistories}
        columns={columns}
        rowKey="id"
        rowSelection={rowSelection}
        pagination={{ pageSize: 15 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无历史记录"
            />
          ),
        }}
        bordered
        scroll={{ x: 800 }}
      />

      {/* 详情抽屉 */}
      <Drawer
        title="历史记录详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
        placement="right"
      >
        {selectedHistory && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="模板">
                {getTemplateName(selectedHistory.templateId)}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDate(selectedHistory.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="标签">
                <Space size={4} wrap>
                  {getTagNames(selectedHistory.tags).map((name, i) => (
                    <Tag key={i}>{name}</Tag>
                  ))}
                  {selectedHistory.tags.length === 0 && <Text type="secondary">无</Text>}
                </Space>
              </Descriptions.Item>
              {selectedHistory.duration && (
                <Descriptions.Item label="执行耗时">
                  {selectedHistory.duration}ms
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedHistory.variables && Object.keys(selectedHistory.variables).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>变量值</Text>
                <div style={{ marginTop: 8 }}>
                  {Object.entries(selectedHistory.variables).map(([k, v]) => (
                    <Tag key={k} color="cyan" style={{ margin: 4 }}>
                      {k} = {v || '(空)'}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <Text strong>提示词内容</Text>
              <div
                style={{
                  marginTop: 8,
                  background: '#f5f7fa',
                  padding: 12,
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 300,
                  overflow: 'auto',
                }}
              >
                {selectedHistory.content}
              </div>
            </div>

            {selectedHistory.result && (
              <div style={{ marginTop: 16 }}>
                <Text strong>执行结果</Text>
                <div
                  style={{
                    marginTop: 8,
                    background: '#f6ffed',
                    padding: 12,
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 13,
                    whiteSpace: 'pre-wrap',
                    maxHeight: 200,
                    overflow: 'auto',
                  }}
                >
                  {selectedHistory.result}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};