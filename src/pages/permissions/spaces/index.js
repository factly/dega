import React from 'react';
import SpacePermissionList from './components/PermissionList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function SpacePermissions() {
  return (
    <Space direction="vertical">
      {/* <Link key="1" to="/permissions/spaces/create">
        <Button>Create New</Button>
      </Link> */}
      <SpacePermissionList />
    </Space>
  );
}

export default SpacePermissions;
