import React from 'react';
import { Popconfirm, Button, Typography, Table, Avatar, Tooltip } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { deletePolicy } from '../../../actions/policies';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';

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
      width: '40%',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.description}</Typography.Paragraph>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: '40%',
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            <Link
              to={{
                pathname: `/members/policies/${record.id}/view`,
              }}
            >
              <Button
                icon={<EyeOutlined />}
                style={{
                  minWidth: 100,
                }}
              >
                View
              </Button>
            </Link>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => dispatch(deletePolicy(record.id)).then(() => fetchPolicies())}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
            >
              <Button
                icon={<DeleteOutlined />}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
                danger
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
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
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
        total: data.total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
        pageSizeOptions: ['10', '15', '20'],
      }}
    />
  );
}

export default PolicyList;
