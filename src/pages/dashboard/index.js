import React from 'react';
import { Space, Typography } from 'antd';
import Features from './components/Features';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function Dashboard() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'dashboard', action: 'get', spaces });
  return (
    <Space direction="vertical">
      <Typography.Title>Dashboard</Typography.Title>
      {actions.includes('admin') ? <Features /> : null}
    </Space>
  );
}

export default Dashboard;
