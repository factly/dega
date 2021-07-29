import React from 'react';
import SpaceRequestList from './components/RequestList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function SpaceRequests() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/requests/spaces/create">
        <Button type="primary">New Space Request</Button>
      </Link>
      <SpaceRequestList />
    </Space>
  );
}

export default SpaceRequests;
