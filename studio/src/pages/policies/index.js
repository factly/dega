import React from 'react';
import { Space, Button, Row } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import PolicyList from './components/PolicyList';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import { getPolicies } from '../../actions/policies';
import deepEqual from 'deep-equal';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';

function Policies() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'policies', action: 'get', spaces });
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { policies, total, loading } = useSelector((state) => {
    const node = state.policies.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        policies: node.data.map((element) => state.policies.details[element]),
        total: node.total,
        loading: state.policies.loading,
      };
    return { policies: [], total: 0, loading: state.policies.loading };
  });

  React.useEffect(() => {
    fetchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPolicies = () => {
    dispatch(getPolicies(filters));
  };

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Policies'} />
      <Row gutter={16} justify="end">
        <Link to="/members/policies/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Policy
          </Button>
        </Link>
      </Row>
      <PolicyList
        actions={actions}
        data={{ policies, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchPolicies={fetchPolicies}
      />
    </Space>
  );
}

export default Policies;
