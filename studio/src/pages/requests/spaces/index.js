import React from 'react';
import SpaceRequestList from './components/RequestList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';

function SpaceRequests() {
  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        <Link key="1" to="/admin/requests/spaces/create">
          <Button type="primary">New Space Request</Button>
        </Link>
      </Row>

      <SpaceRequestList />
    </Space>
  );
}

export default SpaceRequests;
