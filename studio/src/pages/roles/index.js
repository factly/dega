import React from 'react';
import { Space, Button, Row } from 'antd';
import { Link, useLocation } from 'react-router-dom';
//import PolicyList from './components/PolicyList';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import { getRoles } from '../../actions/roles';
import deepEqual from 'deep-equal';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import RoleList from './components/RoleList';

function Roles() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'roles', action: 'get', spaces });
  const dispatch = useDispatch();

  const { roles, total, loading } = useSelector((state) => {
    return {
      roles: state.roles.req?.length
        ? state.roles.req[0].data.map((id) => state.roles.details[id])
        : [],
      total: state.roles.req?.length,
      loading: state.roles.loading,
    };
  });
  React.useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    dispatch(getRoles());
  };

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Roles'} />
      <Row gutter={16} justify="end">
        <Link to="/settings/members/roles/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Role
          </Button>
        </Link>
      </Row>
      <RoleList roles={roles} total={total} loading={loading} />
    </Space>
  );
}

export default Roles;
