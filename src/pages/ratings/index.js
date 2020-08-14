import React from 'react';
import RatingList from './components/RatingList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Ratings() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/ratings/create">
        <Button>Create New</Button>
      </Link>
      <RatingList />
    </Space>
  );
}

export default Ratings;
