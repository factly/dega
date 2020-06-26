import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import FactChecksList from './components/FactChecksList';

function FactChecks() {
  return (
    <Space direction="vertical">
      <Link to="/fact-checks/create">
        <Button>Create New</Button>
      </Link>
      <FactChecksList />
    </Space>
  );
}

export default FactChecks;
