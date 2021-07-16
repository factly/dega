import React from 'react';
import { Popconfirm, Button, Typography, Table, Avatar, Tooltip } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getPolicies, deletePolicy } from '../../../actions/policies';
import { Link, useLocation } from 'react-router-dom';
import deepEqual from 'deep-equal';

function PolicyList({ actions }) {
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

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '20%' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.description}</Typography.Paragraph>
        );
      },
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      width: '25%',
      render: (_, record) => {
        const members = record.users.map((user, index) => (
          <Tooltip
            title={user.first_name + user.last_name}
            placement="top"
            key={index + '.' + user.first_name}
          >
            <Avatar key={index} style={{ float: 'right', margin: '1px' }}>
              {user.email.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        ));

        return <>{members}</>;
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '15%',
      render: (_, record) => {
        return (
          <span>
            <Link
              style={{
                marginRight: 8,
              }}
              to={`/policies/${record.id}/edit`}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('update'))}>
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => dispatch(deletePolicy(record.id)).then(() => fetchPolicies())}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('delete'))}>
                Delete
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={policies}
      loading={loading}
      rowKey={'name'}
      pagination={{
        total: total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
      }}
    />
  );
}

export default PolicyList;
