import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import ClaimsList from './components/ClaimsList';

function Claims() {
  return (
    <Space direction="vertical">
      <Link to="/claims/create">
        <Button>Create New</Button>
      </Link>
      <ClaimsList />
    </Space>
  );
}

export default Claims;
