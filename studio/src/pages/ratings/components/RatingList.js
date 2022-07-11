import React from 'react';
import { Popconfirm, Button, Table } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteRating } from '../../../actions/ratings';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function RatingList({ actions, data, filters, setFilters, fetchRatings }) {
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
            to={`/ratings/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Rating Value', dataIndex: 'numeric_value', key: 'numeric_value' },
    {
      title: 'Preview',
      dataIndex: 'preview',
      render: (_, record) => (
        <div
          style={{
            color: record.text_colour?.hex,
            backgroundColor: record.background_colour?.hex,
            width: '100px',
            border: '1px solid black',
            padding: '0.5rem',
            textAlign: 'center',
          }}
        >
          {record.name}
        </div>
      ),
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
            onConfirm={() => dispatch(deleteRating(record.id)).then(() => fetchRatings())}
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
    <Table
      bordered
      columns={columns}
      dataSource={data.ratings}
      loading={data.loading}
      rowKey={'id'}
      pagination={{
        total: data.total,
        current: filters.page,
        pageSize: filters.limit,
        onChange: (pageNumber, pageSize) => setFilters({ page: pageNumber, limit: pageSize }),
        pageSizeOptions: ['10', '15', '20'],
      }}
    />
  );
}

export default RatingList;
