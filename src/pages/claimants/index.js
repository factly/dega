import React from 'react';
import ClaimantList from './components/ClaimantList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Claimants({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link to="/claimants/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <ClaimantList actions={actions} />
    </Space>
  );
}

export default Claimants;
