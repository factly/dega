import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PolicyList from './components/PolicyList';

function Policies({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link to="/policies/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <PolicyList actions={actions} />
    </Space>
  );
}

export default Policies;
