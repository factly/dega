import React from 'react';
import TagList from './components/TagList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Tags({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link key="1" to="/tags/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <TagList actions={actions} />
    </Space>
  );
}

export default Tags;
