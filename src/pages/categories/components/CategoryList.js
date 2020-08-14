import React from 'react';
import { Popconfirm, Button, Typography, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getCategories, deleteCategory } from '../../../actions/categories';
import { Link } from 'react-router-dom';
import { entitySelector } from '../../../selectors';

function CategoryList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);

  const { categories, total, loading } = useSelector((state) =>
    entitySelector(state, page, 'categories'),
  );

  React.useEffect(() => {
    fetchCategories();
  }, [page]);

  const fetchCategories = () => {
    dispatch(getCategories({ page: page }));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
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
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteCategory(record.id)).then(() => fetchCategories())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
              </Link>
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
      dataSource={categories}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (pageNumber, pageSize) => setPage(pageNumber),
      }}
    />
  );
}

export default CategoryList;
