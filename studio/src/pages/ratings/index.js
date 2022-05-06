import React from 'react';
import RatingList from './components/RatingList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function Ratings({ permission }) {
  const { actions } = permission;
  return (
    <Space direction="vertical">
      <Helmet title={'Ratings'} />
      <Row justify="end">
        <Link key="1" to="/ratings/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Rating
          </Button>
        </Link>
      </Row>

      <RatingList actions={actions} />
    </Space>
  );
}

export default Ratings;
