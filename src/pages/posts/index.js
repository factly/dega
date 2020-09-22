import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from './components/PostList';

function Posts() {
  return (
    <Space direction="vertical">
      <PostList />
    </Space>
  );
}

export default Posts;
