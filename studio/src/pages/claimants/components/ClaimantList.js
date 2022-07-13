import React from 'react';
import { Popconfirm, Button, Typography, Table, Space } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteClaimant } from '../../../actions/claimants';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function ClaimantList({ actions, data, filters, setFilters, fetchClaimants }) {
  const dispatch = useDispatch();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/claimants/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Tag Line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: '20%',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.tag_line}</Typography.Paragraph>
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
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deleteClaimant(record.id)).then(() => fetchClaimants())}
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
        dataSource={data.claimants}
        loading={data.loading}
        rowKey={'id'}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
          pageSizeOptions: ['10', '15', '20'],
        }}
      />
    </Space>
  );
}

export default ClaimantList;
