import React from 'react';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';

function Spaces() {
  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        <Link key="1" to="/admin/spaces/create">
          <Button type="primary">New Space</Button>
        </Link>
      </Row>

      <SpaceList />
    </Space>
  );
}

export default Spaces;
