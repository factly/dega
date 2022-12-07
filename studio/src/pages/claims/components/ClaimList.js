import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteClaim } from '../../../actions/claims';
import { Link } from 'react-router-dom';
 import dayjs from 'dayjs'
import { DeleteOutlined } from '@ant-design/icons';

function ClaimList({ actions, data, filters, fetchClaims, onPagination }) {
  const dispatch = useDispatch();
  const columns = [
    {
      title: 'Claim',
      dataIndex: 'claim',
      key: 'claim',
      width: '30%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/claims/${record.id}/edit`}
          >
            {record.claim}
          </Link>
        );
      },
    },
    { title: 'Claimant', dataIndex: 'claimant', key: 'claimant', width: '20%' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', width: '20%' },
    {
      title: 'Claim Date',
      dataIndex: 'claim_date',
      width: '20%',
      render: (_, record) => {
        return (
          <span title={record.claim_date}>
            {record.claim_date ? dayjs(record.claim_date).format('MMMM Do YYYY') : null}
          </span>
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
            onConfirm={() => dispatch(deleteClaim(record.id)).then(() => fetchClaims())}
            disabled={!(actions.includes('admin') || actions.includes('delete'))}
          >
            <Button
              icon={<DeleteOutlined />}
              disabled={!(actions.includes('admin') || actions.includes('delete'))}
              danger
            />
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Space direction="vertical">
      <Table
        bordered
        columns={columns}
        dataSource={data.claims}
        loading={data.loading}
        rowKey={'id'}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) => onPagination(pageNumber, pageSize),
          pageSizeOptions: ['10', '15', '20'],
        }}
      />
    </Space>
  );
}

export default ClaimList;
