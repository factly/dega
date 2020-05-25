import React from 'react';
import { PageHeader, Divider, Tag, Row } from 'antd';
import SpaceList from './components/SpaceList';
import { Link } from 'react-router-dom';

function Spaces() {
  return (
    <PageHeader
      title="Spaces"
      ghost={false}
      tags={<Tag color="blue">20</Tag>}
      extra={[
        <Link className="ant-btn" key="1" to="/spaces/create">
          Create New
        </Link>,
      ]}
    >
      <Row>
        <Divider />
        <SpaceList />
      </Row>
    </PageHeader>
  );
}

export default Spaces;
