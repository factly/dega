import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from '../../components/List';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';

function Posts({formats}) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });

  return (
    <Space direction="vertical">
      <Link to="/posts/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      { (!formats.loading && formats.article) ? <PostList actions={actions} format={formats.article} />: null}
    </Space>
  );
}

export default Posts;
