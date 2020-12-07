import React from 'react';
import OrganisationPermissionList from './components/PermissionList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function OrganisationPermissions() {
  return (
    <Space direction="vertical">
      {/* <Link key="1" to="/permissions/organisations/create">
        <Button>Create New</Button>
      </Link> */}
      <OrganisationPermissionList />
    </Space>
  );
}

export default OrganisationPermissions;
