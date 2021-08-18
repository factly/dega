import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMenus, deleteMenu } from '../../../actions/menu';
import deepEqual from 'deep-equal';
import { Space, Button, Popconfirm, Table } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function MenuList({ actions }) {
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

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return (
          <Link
            className="andt-dropdown-link"
            style={{
              marginRight: 8,
            }}
            to={`/menus/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() =>
              dispatch(deleteMenu(menus[0].id)).then(() => {
                fetchMenus();
                window.location.reload();
              })
            }
            disabled={!(actions.includes('admin') || actions.includes('delete'))}
          >
            <Button
              icon={<DeleteOutlined />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
              type="danger"
            />
          </Popconfirm>
        );
      },
    },
  ];
  return (
    <Space direction={'vertical'}>
      <Table
        bordered
        columns={columns}
        dataSource={menus}
        loading={loading}
        rowKey={'id'}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default MenuList;
