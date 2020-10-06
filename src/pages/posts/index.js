import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from './components/PostList';

function Posts({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link to="/posts/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <PostList actions={actions} />
    </Space>
  );
}

export default Posts;
