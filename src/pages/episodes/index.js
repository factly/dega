import React from 'react';
import EpisodeList from './components/EpisodeList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Episodes({ permission }) {
  //const { actions } = permission;
  const actions = ['admin'];
  return (
    <Space direction="vertical">
      <Link key="1" to="/episodes/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <EpisodeList actions={actions} />
    </Space>
  );
}

export default Episodes;
