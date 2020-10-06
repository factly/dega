import React from 'react';
import RatingList from './components/RatingList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Ratings({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Link key="1" to="/ratings/create">
        <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
          Create New
        </Button>
      </Link>
      <RatingList actions={actions} />
    </Space>
  );
}

export default Ratings;
