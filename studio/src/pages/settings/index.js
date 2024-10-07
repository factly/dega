import React from 'react';
import { Typography, Row, Col, ConfigProvider, Avatar, Input, Empty } from 'antd';
import {
  CompassTwoTone,
  FundTwoTone,
  TagsTwoTone,
  ApiTwoTone,
  DeploymentUnitOutlined,
  UserOutlined,
  EyeTwoTone,
  InteractionTwoTone,
  FileTextTwoTone,
  SafetyCertificateTwoTone,
} from '@ant-design/icons';

import Website from '../website/index.js';
import Members from '../members/index.js';
import Advanced from '../advanced/index.js';

const settings = [
  {
    name: 'Website',
    component: Website,
    children: [
      {
        name: 'General',
        description: 'Basic Site Details and Site Meta Data',
        url: '/website/general',
        keywords: ['site', 'general', 'meta', 'data', 'details', 'basic'],
        avatar: () => (
          <Avatar
            icon={<DeploymentUnitOutlined />} //<SettingTwoTone twoToneColor="#ffb41f" />}
            style={{ backgroundColor: '#E8EFF2', color: '#ffb41f' }}
          />
        ),
      },
      {
        name: 'Branding',
        keywords: ['site', 'branding', 'logo', 'icon', 'design', 'tokens'],
        description: 'Update Site Logos, icons and design tokens',
        url: '/website/branding',
        avatar: () => (
          <Avatar
            icon={<TagsTwoTone twoToneColor="#51bbf6" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Navigation',
        description: 'Setup Menus',
        keywords: ['site', 'navigation', 'menus', 'menu', 'links', 'link'],
        url: '/website/menus',
        avatar: () => (
          <Avatar
            icon={<CompassTwoTone twoToneColor="#7b2feb" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Analytics',
        description: 'View Analytics for your site',
        url: '/website/analytics',
        keywords: ['site', 'analytics', 'google', 'ga', 'gtag', 'gtag.js', 'gtagjs'],
        avatar: () => (
          <Avatar
            icon={<ApiTwoTone twoToneColor="#30cf43" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Code Injection',
        keywords: ['site', 'code', 'injection', 'custom', 'javascript', 'css', 'html'],
        description: 'Add custom code to your site',
        url: '/website/code-injection',
        avatar: () => (
          <Avatar
            icon={<FundTwoTone twoToneColor="#fb2d8d" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Password and Authentication',
        keywords: ['site', 'code', 'injection', 'custom', 'javascript', 'css', 'html'],
        description: 'Enable Two Factor Authentication',
        url: '/website/authentication',
        avatar: () => (
          <Avatar
            icon={<SafetyCertificateTwoTone twoToneColor="#ff0000" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
    ],
  },
  {
    name: 'Members',
    component: Members,
    children: [
      {
        name: 'Users',
        keywords: ['members'],
        url: '/members',
        description: 'View Users',
        avatar: () => (
          <Avatar
            gap={4}
            icon={<UserOutlined twoToneColor="#ffb41f" />}
            style={{ backgroundColor: '#E8EFF2', color: '#ffb41f' }}
          />
        ),
      },
      {
        name: 'Policies',
        keywords: ['members', 'policies'],
        url: '/members/policies',
        description: 'Update User Policies',
        avatar: () => (
          <Avatar
            gap={4}
            icon={<EyeTwoTone twoToneColor="#51bbf6" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
    ],
  },
  {
    name: 'Advanced',
    component: Advanced,
    children: [
      //  webhooks, reindexing, and formats here
      {
        name: 'Tokens',
        url: '/advanced/tokens',
        keywords: ['webhooks', 'tokens'],
        description: 'Create tokens',
        avatar: () => (
          <Avatar
            gap={4}
            icon={<ApiTwoTone twoToneColor="#51bbf6" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Webhooks',
        url: '/advanced/webhooks',
        keywords: ['webhooks', 'hooks'],
        description: 'Create/ Modify Webhooks',
        avatar: () => (
          <Avatar
            gap={4}
            icon={<ApiTwoTone twoToneColor="#51bbf6" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Re-Indexing Meili',
        url: '/advanced/reindex',
        keywords: ['reindex', 'meili', 'search'],
        description: 'Reindex Meili Database',
        avatar: () => (
          <Avatar
            gap={4}
            icon={<InteractionTwoTone twoToneColor="#7b2feb" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
      {
        name: 'Formats',
        keywords: ['formats', 'content', 'templates'],
        url: '/advanced/formats',
        description: 'Add/Edit Formats',
        avatar: () => (
          <Avatar
            gap={4}
            icon={<FileTextTwoTone twoToneColor="#30cf43" />}
            style={{ backgroundColor: '#E8EFF2' }}
          />
        ),
      },
    ],
  },
];

function Settings() {
  const [searchquery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  const filterMenu = (query, menu) => {
    const matchingResults = [];

    // Loop through each item in the menu array
    for (const item of menu) {
      const matchingChildren = [];

      // Loop through each child item associated with the current item
      for (const child of item.children) {
        // Check if the name, description, or URL of the child item contains the search query
        if (
          child.name.toLowerCase().includes(query.toLowerCase()) ||
          child.url.toLowerCase().includes(query.toLowerCase()) ||
          child.keywords.forEach((keyword) => {
            if (keyword.toLowerCase().includes(query.toLowerCase())) {
              matchingChildren.push(child);
            }
          })
        ) {
          // If it does, add the child item to the `matchingChildren` array
          matchingChildren.push(child);
        }
      }

      // Check if the name of the current item contains the search query
      if (item.name.toLowerCase().includes(query.toLowerCase())) {
        // If so, add the current item to the `matchingResults` array
        matchingResults.push({ ...item, children: matchingChildren });
      } else if (matchingChildren.length > 0) {
        // If only the child items matched, create a new object with the matching children
        matchingResults.push({ ...item, children: matchingChildren });
      }
    }

    return matchingResults;
  };

  const onSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchResults(filterMenu(query, settings));
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            colorBorderSecondary: '#D2D2D2',
          },
        },
      }}
    >
      <Row justify={'end'}>
        <Col md={6} xs={24}>
          <Input.Search
            value={searchquery}
            onChange={onSearch}
            placeholder="Search"
            style={{ borderRadius: '8px', padding: '0 12px', height: '40px' }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        {searchquery.length < 1 ? (
          settings.map((setting) => (
            <Col span={24}>
              <Typography.Title
                style={{
                  color: '#1E1E1E',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                }}
                level={2}
              >
                {setting.name}
              </Typography.Title>
              {setting.component(setting.children)}
            </Col>
          ))
        ) : searchResults.length !== 0 ? (
          searchResults.map((setting) => (
            <Col span={24}>
              <Typography.Title
                style={{
                  color: '#1E1E1E',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                }}
                level={2}
              >
                {setting.name}
              </Typography.Title>
              {setting.component(setting.children)}
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty />
          </Col>
        )}
      </Row>
    </ConfigProvider>
  );
}

export default Settings;
