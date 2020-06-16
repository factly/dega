import React from 'react';
import { Popconfirm, Space } from 'antd';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, deleteCategory } from '../../../actions/categories';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';
import _ from 'lodash';

function CategoriesList() {
  const dispatch = useDispatch();
  const { details, loading, req, total } = useSelector((state) => state.categories);

  const [pagination, setPagination] = useState({
    current: 1,
    defaultPageSize: 5,
    pageSize: 5,
    total,
  });

  var data = [];

  // map data based on query
  req.forEach((each) => {
    const { limit, page } = each.query;
    const { current, pageSize } = pagination;

    if (page == current && limit == pageSize) {
      data = each.ids.map((id) => details[id]);
    }
  });

  const onConfirm = (id) => dispatch(deleteCategory(id));

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
              to={`/categories/edit?id=${record.id}`}
            >
              Edit
            </Link>
            <Popconfirm title="Sure to cancel?" onConfirm={() => onConfirm(record.id)}>
              <Link to="" className="ant-dropdown-link">
                Delete
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  useEffect(() => {
    handleTableChange(pagination);
  }, [total]);

  const handleTableChange = ({ current, pageSize }) => {
    dispatch(getCategories({ page: current, limit: pageSize }));
    setPagination({ ...pagination, current, pageSize, total });
  };

  return (
    <Space direction="vertical">
      <Link className="ant-btn ant-btn-primary" key="1" to="/categories/create">
        Create New
      </Link>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
        }}
        dataSource={data}
        onChange={handleTableChange}
        loading={loading}
        pagination={pagination}
      />
    </Space>
  );
}

export default CategoriesList;
