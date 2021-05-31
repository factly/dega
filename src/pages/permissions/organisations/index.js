import React from 'react';
import OrganisationPermissionList from './components/PermissionList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import getUserPermission from '../../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function OrganisationPermissions() {
  return (
    <Space direction="vertical">
      {/* <Link key="1" to="/permissions/organisations/create">
        <Button>Create New</Button>
      </Link> */}
      <OrganisationPermissionList actions={actions}/>
    </Space>
  );
}

export default OrganisationPermissions;
