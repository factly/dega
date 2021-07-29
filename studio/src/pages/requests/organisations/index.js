import React from 'react';
import OrganisationRequestList from './components/RequestList';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';

function OrganisationRequests() {
  return (
    <Space direction="vertical">
      <Link key="1" to="/requests/organisations/create">
        <Button type="primary">New Organisation Request</Button>
      </Link>
      <OrganisationRequestList />
    </Space>
  );
}

export default OrganisationRequests;
