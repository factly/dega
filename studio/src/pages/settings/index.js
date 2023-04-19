import React from 'react';
import { Typography, Row, Col, ConfigProvider } from 'antd';
import Website from '../website/index.js';
import Members from '../members/index.js';
import Advanced from '../advanced/index.js';

function Settings() {
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
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Typography.Title
            style={{ color: '#1E1E1E', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}
            level={2}
          >
            Website
          </Typography.Title>
          <Website />
        </Col>
        <Col span={24}>
          <Typography.Title
            style={{ color: '#1E1E1E', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}
            level={2}
          >
            Members
          </Typography.Title>
          <Members />
        </Col>
        <Col span={24}>
          <Typography.Title
            style={{ color: '#1E1E1E', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}
            level={2}
          >
            Advanced
          </Typography.Title>
          <Advanced />
        </Col>
      </Row>
    </ConfigProvider>
  );
}

export default Settings;
