import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import ClaimList from './components/ClaimList';

function Claims() {
  return (
    <Space direction="vertical">
      <Link to="/claims/create">
        <Button>Create New</Button>
      </Link>
      <ClaimList />
    </Space>
  );
}

export default Claims;
