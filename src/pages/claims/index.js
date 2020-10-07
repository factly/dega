import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import ClaimList from './components/ClaimList';

function Claims({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link to="/claims/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <ClaimList actions={actions} />
    </Space>
  );
}

export default Claims;
