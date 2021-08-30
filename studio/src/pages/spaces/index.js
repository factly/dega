import React from 'react';
import { Space, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';
import { useSelector } from 'react-redux';

function Spaces() {
  const { role } = useSelector((state) => {
    const { selected, orgs } = state.spaces;

    if (selected > 0) {
      const space = state.spaces.details[selected];
      const orgId = space.organisation_id;
      const org = orgs.find((org) => org.id === orgId);
      const role = org.permission.role;
      return {
        role: role,
      };
    }
    return { role: 'member' };
  });

  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        {role === 'owner' ? (
          <Col>
            <Link key="2" to="/reindex">
              <Button>Reindex</Button>
            </Link>
          </Col>
        ) : null}
        <Col>
          <Link key="1" to="/spaces/create">
            <Button type="primary">New Space</Button>
          </Link>
        </Col>
        <Link key="1" to="/admin/spaces/create">
          <Button type="primary">New Space</Button>
        </Link>
      </Row>
      <SpaceList />
    </Space>
  );
}

export default Spaces;
