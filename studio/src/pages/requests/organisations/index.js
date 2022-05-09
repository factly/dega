import React from 'react';
import OrganisationRequestList from './components/RequestList';
import { Space, Button, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function OrganisationRequests() {
  return (
    <Space direction="vertical">
      <Helmet title={'Organisation Requests'} />
      <Row gutter={16} justify="end">
        <Link key="1" to="/admin/requests/organisations/create">
          <Button type="primary">New Organisation Request</Button>
        </Link>
      </Row>

      <OrganisationRequestList />
    </Space>
  );
}

export default OrganisationRequests;
