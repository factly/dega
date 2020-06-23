import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostsList from './components/PostsList';

function Posts() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/posts/create">
        <Button>Create New</Button>
      </Link>
      <PostsList />
    </Space>
  );
}

export default Posts;
