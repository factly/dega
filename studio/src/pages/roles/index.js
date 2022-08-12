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
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);

  const { roles, total, loading } = useSelector((state) => {
    const node = state.roles.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        roles: node.data.map((element) => state.roles.details[element]),
        total: node.total,
        loading: state.roles.loading,
      };
    return { roles: [], total: 0, loading: state.roles.loading };
  });
  React.useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  console.log(roles, 'roles');
  const fetchRoles = () => {
    dispatch(getRoles(filters));
  };
  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Roles'} />
      <Row gutter={16} justify="end">
        <Link to="/members/roles/create">
          <Button
            //  disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Role
          </Button>
        </Link>
      </Row>
      <RoleList
        // actions={actions}
        data={roles}

        // filters={filters}
        // setFilters={setFilters}
        // fetchPolicies={fetchPolicies}
      />
    </Space>
  );
}

export default Roles;
