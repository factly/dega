import React from 'react';
import EventList from './components/EventList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function Events() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/events/create">
        <Button>Create New</Button>
      </Link>
      {/* <EventList /> */}
    </Space>
  );
}

export default Events;
