import React from 'react';
import TagsList from './components/TagsList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Tags() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/tags/create">
        <Button>Create New</Button>
      </Link>
      <TagsList />
    </Space>
  );
}

export default Tags;
