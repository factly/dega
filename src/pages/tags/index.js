import React from 'react';
import TagList from './components/TagList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Tags() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/tags/create">
        <Button>Create New</Button>
      </Link>
      <TagList />
    </Space>
  );
}

export default Tags;
