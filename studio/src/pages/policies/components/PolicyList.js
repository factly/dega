import React from 'react';
import { Popconfirm, Button, Typography, Table, Avatar, Tooltip } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { deletePolicy } from '../../../actions/policies';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function PolicyList({ actions, data, filters, setFilters, fetchPolicies }) {
  const dispatch = useDispatch();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/members/policies/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
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
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deletePolicy(record.id)).then(() => fetchPolicies())}
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
    <Table
      bordered
      columns={columns}
      dataSource={data.policies}
      loading={data.loading}
      rowKey={'name'}
      pagination={{
        total: data.total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
      }}
    />
  );
}

export default PolicyList;
