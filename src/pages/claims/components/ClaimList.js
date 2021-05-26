import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteClaim } from '../../../actions/claims';
import { Link } from 'react-router-dom';
import moment from 'moment';

function ClaimList({ actions, data, filters, setFilters, fetchClaims }) {
  const dispatch = useDispatch();
  const columns = [
    { title: 'Claim', dataIndex: 'claim', key: 'claim', width: '20%' },
    { title: 'Claimant', dataIndex: 'claimant', key: 'claimant', width: '20%' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', width: '20%' },
    {
      title: 'Claim Date',
      dataIndex: 'claim_date',
      width: '20%',
      render: (_, record) => {
        return (
          <span title={record.claim_date}>
            {record.claim_date ? moment(record.claim_date).format('MMMM Do YYYY') : null}
          </span>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/claims/${record.id}/edit`}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('update'))}>
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() => dispatch(deleteClaim(record.id)).then(() => fetchClaims())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button disabled={!(actions.includes('admin') || actions.includes('delete'))}>
                  Delete
                </Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
      width: '20%',
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
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default ClaimList;
