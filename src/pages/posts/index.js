import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from '../../components/List';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useLocation } from 'react-router-dom';

function Posts({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });
  let query = new URLSearchParams(useLocation().search);
  const status = query.get('status');

  if (!formats.loading && formats.article)
    return (
      <Space direction="vertical">
        <Link to="/posts/create">
          <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
            Create New
          </Button>
        </Link>
        <PostList actions={actions} format={formats.article} status={status} />
      </Space>
    );
  return <FormatNotFound status="info" title="Article format not found" link="/formats/create" />;
}

export default Posts;
