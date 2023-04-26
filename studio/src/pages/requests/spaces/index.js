import React from 'react';
import SpaceRequestList from './components/RequestList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';

function SpaceRequests() {
  return (
    <Space direction="vertical">
      <Helmet title={'Space Requests'} />
      <Row gutter={16} justify="end">
        <Link key="1" to="/admin/requests/spaces/create">
          <Button
            icon={<PlusOutlined />}
            type="primary">Create</Button>
        </Link>
      </Row>

      <SpaceRequestList />
    </Space>
  );
}

export default SpaceRequests;
