import React from 'react';
import { Space, Typography } from 'antd';
import Features from './components/Features';

function Dashboard() {
  return (
    <Space direction="vertical">
      <Typography.Title>Dashboard</Typography.Title>
      <Features />
    </Space>
  );
}

export default Dashboard;
