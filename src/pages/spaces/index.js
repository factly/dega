import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';

function Spaces() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/spaces/create">
        <Button>Create New</Button>
      </Link>
      <SpaceList />
    </Space>
  );
}

export default Spaces;
