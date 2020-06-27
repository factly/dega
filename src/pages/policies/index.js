import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PoliciesList from './components/PoliciesList';

function Policies() {
  return (
    <Space direction="vertical">
      <Link to="/policies/create">
        <Button>Create New</Button>
      </Link>
      <PoliciesList />
    </Space>
  );
}

export default Policies;
