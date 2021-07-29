import React from 'react';
import { Popconfirm, Button, Table, Space } from 'antd';

import { useDispatch } from 'react-redux';
import { deleteCategory } from '../../../actions/categories';
import { Link } from 'react-router-dom';

function CategoryList({ actions, data, filters, setFilters, fetchCategories }) {
  const dispatch = useDispatch();
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Parent Category', dataIndex: 'parent_id', key: 'parent_id' },
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
              to={`/categories/${record.id}/edit`}
            >
              <Button disabled={!(actions.includes('admin') || actions.includes('update'))}>
                Edit
              </Button>
            </Link>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => dispatch(deleteCategory(record.id)).then(() => fetchCategories())}
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
          </span>
        );
      },
    },
  ];

  return (
    <Space direction={'vertical'}>
      <Table
        bordered
        columns={columns}
        dataSource={data.categories}
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

export default CategoryList;
