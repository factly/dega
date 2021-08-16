import React from 'react';
import { Space, Button, Row, Col, Menu, Dropdown } from 'antd';
import { Link } from 'react-router-dom';
import SpaceList from './components/SpaceList';
import { useDispatch, useSelector } from 'react-redux';
import { reindexOrg, reindex } from '../../actions/meiliReindex';
import { DownOutlined } from '@ant-design/icons';

function Spaces() {
  const dispatch = useDispatch();

  const { role, orgId } = useSelector((state) => {
    const { selected, orgs, loading } = state.spaces;

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
  const superOrg = useSelector(({ admin }) => {
    return admin.organisation;
  });
  const handleOrgReindex = () => {
    dispatch(reindexOrg(orgId));
  };
  const handleReindex = () => {
    dispatch(reindex());
  };
  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => handleReindex()}>
        Entire Instance
      </Menu.Item>
      <Menu.Item key="2" onClick={() => handleOrgReindex()}>
        Super Organisation
      </Menu.Item>
    </Menu>
  );
  return (
    <Space direction="vertical">
      <Row gutter={16} justify="end">
        {superOrg.is_admin ? (
          <Col>
            <Dropdown overlay={menu}>
              <Button>
                Reindex <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        ) : role === 'owner' ? (
          <Button onClick={() => handleOrgReindex()}>Reindex</Button>
        ) : null}

        <Col>
          <Link key="1" to="/spaces/create">
            <Button type="primary">New Space</Button>
          </Link>
        </Col>
      </Row>

      <SpaceList role={role} />
    </Space>
  );
}

export default Spaces;
