import React, { useEffect, useState } from 'react';
import { Layout as AntLayout, Menu, Button, Typography, Badge, Space, theme } from 'antd';
import {
  FileTextOutlined,
  SettingOutlined,
  HistoryOutlined,
  TagOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { usePromptStore } from '../store/promptStore';

const { Header, Sider, Content } = AntLayout;
const { Title, Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (page: 'templates' | 'variables' | 'history' | 'tags') => void;
  currentPage: 'templates' | 'variables' | 'history' | 'tags';
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentPage }) => {
  const { tags, init, isInitialized } = usePromptStore();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (!isInitialized) {
      init().catch(console.error);
    }
  }, [init, isInitialized]);

  const menuItems = [
    {
      key: 'templates',
      icon: <FileTextOutlined />,
      label: '提示词模板',
    },
    {
      key: 'variables',
      icon: <SettingOutlined />,
      label: '全局变量',
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '历史记录',
    },
    {
      key: 'tags',
      icon: <TagOutlined />,
      label: '标签管理',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    onNavigate(key as 'templates' | 'variables' | 'history' | 'tags');
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Title level={4} style={{ color: '#fff', margin: 0, fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? '📝' : 'Prompt Manager'}
          </Title>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DatabaseOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />
              {!collapsed && (
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                  {isInitialized ? '已连接' : '连接中...'}
                </Text>
              )}
              {!collapsed && (
                <Badge
                  status={isInitialized ? 'success' : 'processing'}
                  style={{ marginLeft: 'auto' }}
                />
              )}
            </div>
            {!collapsed && (
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                🏷️ 标签: {tags.length}
              </Text>
            )}
          </Space>
        </div>
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 220, transition: 'all 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <Title level={5} style={{ margin: 0, fontWeight: 500 }}>
              {menuItems.find(item => item.key === currentPage)?.label || '提示词管理'}
            </Title>
          </Space>
          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              v1.0.0
            </Text>
          </Space>
        </Header>

        <Content
          style={{
            margin: 16,
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};