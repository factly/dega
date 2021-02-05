import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import PostList from '../../components/List';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function Posts({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'posts', action: 'get', spaces });

  if (!formats.loading && formats.article)
    return (
      <Space direction="vertical">
        <Link to="/posts/create">
          <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
            Create New
          </Button>
        </Link>
        <PostList actions={actions} format={formats.article} />
      </Space>
    );
  return (
    <FormatNotFound status="info" title="Fact-Check format not found" link="/formats/create" />
  );
}

export default Posts;
