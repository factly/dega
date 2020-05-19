import React, { useState } from 'react';
import { PageHeader, Divider, Tag, Button, Statistic, Row } from 'antd';
import SpaceCreateForm from './components/SpaceCreateForm';
import SpaceList from './components/SpaceList';

import styles from './index.css';
import { Link } from 'react-router-dom';

function Spaces() {
  return (
    <PageHeader
      onBack={() => window.history.back()}
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
