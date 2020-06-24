import React from 'react';
import ClaimantsList from './components/ClaimantsList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Claimants() {
  return (
    <Space direction="vertical">
      <Link to="/claimants/create">
        <Button>Create New</Button>
      </Link>
      <ClaimantsList />
    </Space>
  );
}

export default Claimants;
