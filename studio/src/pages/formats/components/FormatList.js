import React from 'react';
import { Popconfirm, Button, Typography, Table } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteFormat } from '../../../actions/formats';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';

function FormatList({ actions, data, filters, setFilters, fetchFormats }) {
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
            to={`/advanced/formats/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
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
      width: 150,
      render: (_, record) => {
        return (
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deleteFormat(record.id)).then(() => fetchFormats())}
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
    <Table
      bordered
      columns={columns}
      dataSource={data.formats}
      loading={data.loading}
      rowKey={'id'}
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

export default FormatList;
