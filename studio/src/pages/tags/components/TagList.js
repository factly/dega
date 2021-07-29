import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteTag } from '../../../actions/tags';
import { Link } from 'react-router-dom';

function TagList({ actions, filters, setFilters, fetchTags, data }) {
  const dispatch = useDispatch();
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (_, record) => {
        return (
          <Link
            className="ant-dropdown-link"
            style={{
              marginRight: 8,
            }}
            to={`/tags/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: '15%' },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => dispatch(deleteTag(record.id)).then(() => fetchTags())}
          >
            <Link to="" className="ant-dropdown-link">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
                type="danger"
              >
                Delete
              </Button>
            </Link>
          </Popconfirm>
        );
      },
      width: '20%',
    },
  ];

  return (
    <Space direction={'vertical'}>
      <Table
        bordered
        columns={columns}
        dataSource={data.tags}
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

export default TagList;
