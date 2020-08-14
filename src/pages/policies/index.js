import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PolicyList from './components/PolicyList';

function Policies() {
  return (
    <Space direction="vertical">
      <Link to="/policies/create">
        <Button>Create New</Button>
      </Link>
      <PolicyList />
    </Space>
  );
}

export default Policies;
