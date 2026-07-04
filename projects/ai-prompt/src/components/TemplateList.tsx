import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Tag,
  Space,
  Empty,
  Row,
  Col,
  Typography,
  Dropdown,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  StarOutlined,
  StarFilled,
  UnorderedListOutlined,
  AppstoreOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';
import type { PromptTemplate } from '../types/prompt';

const { Text, Paragraph } = Typography;

interface TemplateListProps {
  onEdit: (template: PromptTemplate) => void;
  onSelect: (template: PromptTemplate) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onSelect }) => {
  const {
    templates,
    tags,
    searchTemplates,
    getTemplatesByTags,
    deleteTemplate,
    deleteTemplates,
    toggleFavorite,
    searchKeyword,
    selectedTagIds,
    setSearchKeyword,
    setSelectedTags,
    viewMode,
    setViewMode,
  } = usePromptStore();

  const [displayTemplates, setDisplayTemplates] = useState<PromptTemplate[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  useEffect(() => {
    let result = templates;
    if (selectedTagIds.length > 0) {
      result = getTemplatesByTags(selectedTagIds);
    }
    if (searchKeyword.trim()) {
      result = searchTemplates(searchKeyword);
    }
    setDisplayTemplates(result);
  }, [templates, searchKeyword, selectedTagIds, searchTemplates, getTemplatesByTags]);

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
    message.success('删除成功');
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    await deleteTemplates(selectedRowKeys);
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 个模板`);
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds.map(id => tags.find(t => t.id === id)).filter(Boolean);
  };

  const getTagColor = (tagId: string) => {
    return tags.find(t => t.id === tagId)?.color || '#1890ff';
  };

  // 渲染卡片视图
  const renderGrid = () => (
    <Row gutter={[16, 16]}>
      {displayTemplates.map(template => (
        <Col key={template.id} xs={24} sm={12} lg={8} xl={6}>
          <Card
            className="card-hover"
            style={{ height: '100%' }}
            actions={[
              <Tooltip title="收藏">
                <Button
                  type="text"
                  icon={template.favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                  onClick={() => handleToggleFavorite(template.id)}
                />
              </Tooltip>,
              <Tooltip title="使用">
                <Button
                  type="text"
                  icon={<PlayCircleOutlined />}
                  onClick={() => onSelect(template)}
                />
              </Tooltip>,
              <Tooltip title="编辑">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(template)}
                />
              </Tooltip>,
              <Popconfirm
                title="确定删除此模板？"
                onConfirm={() => handleDelete(template.id)}
                okText="确定"
                cancelText="取消"
              >
                <Tooltip title="删除">
                  <Button type="text" icon={<DeleteOutlined />} danger />
                </Tooltip>
              </Popconfirm>,
            ]}
          >
            <Card.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text ellipsis style={{ flex: 1 }}>
                    {template.name}
                  </Text>
                  {template.favorite && <StarFilled style={{ color: '#faad14', fontSize: 14 }} />}
                </div>
              }
              description={
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ color: '#8c8c8c', minHeight: 40, marginBottom: 8 }}
                >
                  {template.description || '暂无描述'}
                </Paragraph>
              }
            />
            <div style={{ marginTop: 12 }}>
              <Space size={4} wrap>
                {getTagNames(template.tags).map(tag => (
                  <Tag key={tag?.id} color={tag?.color || 'default'} style={{ margin: 2 }}>
                    {tag?.name}
                  </Tag>
                ))}
              </Space>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#bfbfbf' }}>
              <Space>
                <span>变量: {template.variables.length > 0 ? template.variables.join(', ') : '无'}</span>
                <span>|</span>
                <span>更新: {new Date(template.updatedAt).toLocaleDateString()}</span>
              </Space>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // 渲染列表视图
  const renderList = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {displayTemplates.map(template => (
        <Card key={template.id} size="small">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
              <Button
                type="text"
                icon={template.favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={() => handleToggleFavorite(template.id)}
              />
              <div>
                <Text strong>{template.name}</Text>
                {template.description && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                    {template.description}
                  </Text>
                )}
                <div style={{ marginTop: 4 }}>
                  <Space size={4} wrap>
                    {getTagNames(template.tags).map(tag => (
                      <Tag key={tag?.id} color={tag?.color || 'default'} style={{ margin: 0 }}>
                        {tag?.name}
                      </Tag>
                    ))}
                  </Space>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#bfbfbf', marginRight: 12 }}>
              变量: {template.variables.length > 0 ? template.variables.join(', ') : '无'}
            </div>
            <Space>
              <Button size="small" icon={<PlayCircleOutlined />} onClick={() => onSelect(template)}>
                使用
              </Button>
              <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(template)}>
                编辑
              </Button>
              <Popconfirm
                title="确定删除？"
                onConfirm={() => handleDelete(template.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button size="small" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </Space>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 工具栏 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索提示词..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 260 }}
          allowClear
        />
        <Space>
          <Button
            icon={<AppstoreOutlined />}
            type={viewMode === 'grid' ? 'primary' : 'default'}
            onClick={() => setViewMode('grid')}
          />
          <Button
            icon={<UnorderedListOutlined />}
            type={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          />
        </Space>
        <div style={{ flex: 1 }} />
        {selectedRowKeys.length > 0 && (
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 个模板？`}
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              批量删除 ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
        <Button type="primary" icon={<PlusOutlined />} onClick={() => onEdit(null as any)}>
          新建提示词
        </Button>
      </div>

      {/* 标签筛选 */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <FilterOutlined style={{ color: '#8c8c8c', marginRight: 4 }} />
          {tags.map(tag => (
            <Tag.CheckableTag
              key={tag.id}
              checked={selectedTagIds.includes(tag.id)}
              onChange={() => {
                const newSelected = selectedTagIds.includes(tag.id)
                  ? selectedTagIds.filter(id => id !== tag.id)
                  : [...selectedTagIds, tag.id];
                setSelectedTags(newSelected);
              }}
              style={{ borderColor: tag.color, color: selectedTagIds.includes(tag.id) ? '#fff' : undefined }}
            >
              {tag.name}
            </Tag.CheckableTag>
          ))}
          {selectedTagIds.length > 0 && (
            <Button type="link" size="small" onClick={() => setSelectedTags([])}>
              清除筛选
            </Button>
          )}
        </div>
      )}

      {/* 统计信息 */}
      <Text type="secondary" style={{ fontSize: 13 }}>
        共 {displayTemplates.length} 个模板
      </Text>

      {/* 模板列表 */}
      {displayTemplates.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无提示词模板"
          style={{ padding: '40px 0' }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={() => onEdit(null as any)}>
            创建第一个模板
          </Button>
        </Empty>
      ) : viewMode === 'grid' ? (
        renderGrid()
      ) : (
        renderList()
      )}
    </div>
  );
};