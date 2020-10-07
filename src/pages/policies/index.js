import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PolicyList from './components/PolicyList';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function Policies() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'policies', action: 'get', spaces });

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
