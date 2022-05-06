import React from 'react';
import EventList from './components/EventList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function Events() {
  return (
    <Space direction="vertical">
      <Helmet title={'Events'} />;
      <Row gutter={16} justify="end">
        <Link key="1" to="/admin/events/create">
          <Button type="primary">New Event</Button>
        </Link>
      </Row>
      <EventList />
    </Space>
  );
}

export default Events;
