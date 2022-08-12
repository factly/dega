import React from 'react';
import { Space, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

function Spaces() {
  const { role } = useSelector((state) => {
    const { selected, orgs } = state.spaces;

    if (selected > 0) {
      const space = state.spaces.details[selected];
      const orgId = space.organisation_id;
      console.log(orgId, 'orgID');
      console.log(orgs, 'orgs orgs');
      const org = orgs.find((org) => {
        console.log(org, 'org map');
        console.log(org.organisation.id, 'org.organisation_id map');
        return org.organisation.id === orgId;
      });
      console.log(org, 'org');
      const role = org.permission.role;
      return {
        role: role,
      };
    }
    return { role: 'member' };
  });

  return (
    <Space direction="vertical">
      <Helmet title={'Spaces'} />
      <Row gutter={16} justify="end">
        {role === 'owner' ? (
          <Col>
            <Link key="2" to="/advanced/reindex">
              <Button>Reindex</Button>
            </Link>
          </Col>
        ) : null}
        <Link key="1" to="/admin/spaces/create">
          <Button type="primary">New Space</Button>
        </Link>
      </Row>
      <SpaceList />
    </Space>
  );
}

export default Spaces;
