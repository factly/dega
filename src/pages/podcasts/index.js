import React from 'react';
import PodcastList from './components/PodcastList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Podcasts({ permission }) {
  //const { actions } = permission;
  const actions = ['admin'];
  return (
    <Space direction="vertical">
      <Link key="1" to="/podcasts/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <PodcastList actions={actions} />
    </Space>
  );
}

export default Podcasts;
