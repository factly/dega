import React from 'react';
import SpacePermissionList from './components/PermissionList';
import { Space } from 'antd';
import { useSelector } from 'react-redux';

function SpacePermissions() {
  const superOrg = useSelector(({ admin }) => {
    return admin.organisation;
  });

  return (
    <Space direction="vertical">
      {/* <Link key="1" to="/permissions/spaces/create">
        <Button>Create New</Button>
      </Link> */}
      <SpacePermissionList admin={superOrg.is_admin ? superOrg.is_admin : false} />
    </Space>
  );
}

export default SpacePermissions;
