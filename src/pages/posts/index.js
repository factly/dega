import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from './components/PostList';
import getUserPermission from '../../utils/getUserPermission';

function Posts() {
  const actions = getUserPermission({ resource: 'posts', action: 'get' });
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
