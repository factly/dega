import React from 'react';
import ClaimantList from './components/ClaimantList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Claimants() {
  return (
    <Space direction="vertical">
      <Link to="/claimants/create">
        <Button>Create New</Button>
      </Link>
      <ClaimantList />
    </Space>
  );
}

export default Claimants;
