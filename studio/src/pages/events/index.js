import React from 'react';
import EventList from './components/EventList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';

function Events() {
  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        <Link key="1" to="/events/create">
          <Button type="primary">New Event</Button>
        </Link>
      </Row>

      <EventList />
    </Space>
  );
}

export default Events;
