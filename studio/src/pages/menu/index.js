import React from 'react';
import { Space, Button, Row } from 'antd';
import MenuList from './components/MenuList';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMenus } from '../../actions/menu';
import deepEqual from 'deep-equal';
import getUserPermission from '../../utils/getUserPermission';
import Loader from '../../components/Loader';

function Menu() {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'menus', action: 'get', spaces });
  const dispatch = useDispatch();
  const query = new URLSearchParams(useLocation().search);
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  query.set('page', filters.page);
  window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { menus, total, loading } = useSelector((state) => {
    const node = state.menus.req.find((item) => {
      return deepEqual(item.query, filters);
    });
    if (node)
      return {
        menus: node.data.map((element) => state.menus.details[element]),
        total: node.total,
        loading: state.menus.loading,
      };
    return { menus: [], total: 0, loading: state.menus.loading };
  });
  React.useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMenus = () => {
    dispatch(getMenus(filters));
  };
  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Row justify="end">
        <Link to="/website/menus/create">
          <Button
            disabled={!(actions.includes('admin') || actions.includes('create'))}
            type="primary"
          >
            New Menu
          </Button>
        </Link>
      </Row>

      <MenuList
        actions={actions}
        data={{ menus, total, loading }}
        filters={filters}
        setFilters={setFilters}
        fetchMenus={fetchMenus}
      />
    </Space>
  );
}

export default Menu;
