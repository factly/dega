import React from 'react';
import RatingsList from './components/RatingsList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Ratings() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/ratings/create">
        <Button>Create New</Button>
      </Link>
      <RatingsList />
    </Space>
  );
}

export default Ratings;
