import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from './components/PostList';

function Posts() {
  return (
    <Space direction="vertical">
      <Link to="/posts/create">
        <Button>Create New</Button>
      </Link>
      <PostList />
    </Space>
  );
}

export default Posts;
