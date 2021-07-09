import React from 'react';
import OrganisationPermissionList from './components/PermissionList';
import { Space, Button } from 'antd';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function OrganisationPermissions() {
  const superOrg = useSelector(({ admin }) => {
    return admin.organisation;
  });

  return (
    <Space direction="vertical">
      {/* <Link key="1" to="/permissions/organisations/create">
        <Button>Create New</Button>
      </Link> */}
      <OrganisationPermissionList admin={superOrg.is_admin ? superOrg.is_admin : false} />
    </Space>
  );
}

export default OrganisationPermissions;
