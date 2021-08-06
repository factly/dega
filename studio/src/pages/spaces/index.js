import React from 'react';
import { Space, Button, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';
import { useDispatch, useSelector } from 'react-redux';
import { reindexOrg } from '../../actions/meiliReindex';

function Spaces() {
  const dispatch = useDispatch();

  const { role, orgId } = useSelector((state) => {
    const { selected, orgs, loading } = state.spaces;
    console.log('spaces', state.spaces);
    if (selected > 0) {
      const space = state.spaces.details[selected];
      const orgId = space.organisation_id;
      const org = orgs.find((org) => org.id === orgId);
      const role = org.permission.role;
      return {
        loading: loading,
        role: role,
        orgId: orgId,
      };
    }
    return { loading: loading, role: 'member', orgId: 0 };
  });

  const handleOrgReindex = () => {
    dispatch(reindexOrg(orgId));
  };

  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        {role === 'owner' ? (
          <Col>
            <Button type="primary" onClick={() => handleOrgReindex()}>
              Reindex
            </Button>
          </Col>
        ) : null}
        <Col>
          <Link key="1" to="/spaces/create">
            <Button type="primary">New Space</Button>
          </Link>
        </Col>
      </Row>

      <SpaceList />
    </Space>
  );
}

export default Spaces;
